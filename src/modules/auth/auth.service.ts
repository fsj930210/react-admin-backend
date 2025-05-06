import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as ms from 'ms';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import { UserVo } from '../user/vo/user.vo';
import { LoginDto } from './dto/login.dto';
import { REDIS_CLIENT } from '@/constants/common.constant';
import * as svgCaptcha from 'svg-captcha';
import { CaptchaDto } from './dto/captcha.dto';
import { isEmpty } from 'lodash-es';
import { nanoid } from 'nanoid';
import { generateRedisKey, getErrorMessage } from '@/utils/utils';
import { BusinessException } from '@/exceptions/business.exception';
import { ErrorCodeEnum } from '@/enum/error_code.enum';
import { Response } from 'express';
import {
  CAPTCHA_REDIS_KEY_PREFIX,
  JTI_KEY_PREFIX,
  TOKEN_BLACKLIST_KEY_PREFIX,
} from './constants/auth.constants';
import { JwtPayload } from './interface/jwt.payload';

@Injectable()
export class AuthService {
  @Inject()
  private readonly userService: UserService;
  @Inject()
  private readonly configService: ConfigService;
  @Inject()
  private readonly jwtService: JwtService;
  @Inject(REDIS_CLIENT)
  private readonly redis: Redis;
  async login(loginDto: LoginDto, res: Response) {
    const { password, captcha } = loginDto;
    if (this.configService.get('captcha.enable') === true) {
      await this.validateCaptcha(loginDto.captcha_id, captcha);
    }
    const account = loginDto.account;
    const user = await this.userService.validateUser(account, password);
    // 生成一个jti(jwt id)
    const jti = nanoid();
    // 将jti(jwt id)存入redis中，而不是具体的token
    await this.redis.set(
      generateRedisKey(JTI_KEY_PREFIX, jti),
      user.id,
      'EX',
      ms(this.configService.get('jwt.refreshTokenExpiresIn') as ms.StringValue) / 1000,
    );
    // 将refreshToken 写入cookie
    res.cookie('refresh_token', this.generateRefreshToken(user, jti), {
      httpOnly: true,
      maxAge: ms(this.configService.get('jwt.refreshTokenExpiresIn') as ms.StringValue),
    });
    return {
      access_token: this.generateAccessToken(user, jti),
    };
  }
  async loginByQrCode() {}
  async refreshToken(oldRefreshToken: string, res: Response) {
    // 验证
    const payload = await this.validateRefreshToken(oldRefreshToken);
    const [exists, userId] = await Promise.all([
      this.redis.exists(`${JTI_KEY_PREFIX}${payload.jti}`),
      this.redis.get(`${JTI_KEY_PREFIX}${payload.jti}`),
    ]);
    if (!exists || String(userId) !== String(payload.sub.userId)) {
      throw new UnauthorizedException(getErrorMessage(ErrorCodeEnum.EXPIRED_REFRESH_TOKEN));
    }
    // 查找用户，确保用户存在
    const user = await this.userService.validateUserExistByUsername(payload.sub.username);
    // 生成一个jti(jwt id)
    const newJti = nanoid();
    // 过期时间 单位 秒
    const expires =
      ms(this.configService.get('jwt.refreshTokenExpiresIn') as ms.StringValue) / 1000;
    // lua 脚本保证执行原子性
    const luaScript = `
      redis.call('SET', '${TOKEN_BLACKLIST_KEY_PREFIX}${payload.jti}', 1, 'EX', ${expires})
      redis.call('DEL', '${JTI_KEY_PREFIX}${payload.jti}')
      redis.call('SET', '${JTI_KEY_PREFIX}${newJti}', '${userId}', 'EX', ${expires})
      return 1
    `;

    await this.redis.eval(luaScript, 0);

    res.cookie('refresh_token', this.generateRefreshToken(user, newJti), {
      httpOnly: true,
      maxAge: expires * 1000,
    });

    return { access_token: this.generateAccessToken(user, newJti) };
  }
  async logout(jti: string, res: Response) {
    const ttl = await this.redis.ttl(`${JTI_KEY_PREFIX}${jti}`);
    if (ttl > 0) {
      await this.redis.set(`${TOKEN_BLACKLIST_KEY_PREFIX}${jti}`, 1, 'EX', ttl);
      await this.redis.del(`${JTI_KEY_PREFIX}${jti}`);
    }
    res.clearCookie('refresh_token');
  }
  generateAccessToken(user: UserVo, jid: string) {
    const accessToken = this.jwtService.sign(
      {
        sub: {
          userId: user.id,
          username: user.username,
          type: 'access_token',
        },
        jid,
      },
      {
        expiresIn: this.configService.get('jwt.expiresIn'),
        secret: this.configService.get('jwt.secret'),
      },
    );
    return accessToken;
  }
  generateRefreshToken(user: UserVo, jid: string) {
    const refreshToken = this.jwtService.sign(
      {
        sub: {
          userId: user.id,
          username: user.username,
          type: 'refresh_token',
        },
        jid,
      },
      {
        secret: this.configService.get('jwt.refreshTokenSecret'),
        expiresIn: this.configService.get('jwt.refreshTokenExpiresIn'),
      },
    );
    return refreshToken;
  }
  async generateSvgCaptcha(dto: CaptchaDto) {
    const { width, height } = dto;
    const svg = svgCaptcha.create({
      size: 4,
      color: true,
      noise: 4,
      width: width || 100,
      height: height || 32,
      charPreset: '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    });
    const result = {
      image: `data:image/svg+xml;base64,${Buffer.from(svg.data).toString('base64')}`,
      id: nanoid(),
    };
    // 内容跟id 存进r edis
    await this.redis.set(
      generateRedisKey(CAPTCHA_REDIS_KEY_PREFIX, result.id),
      svg.text,
      'EX',
      Number(this.configService.get('captcha.ttl')),
    );
    return result;
  }
  async validateCaptcha(id: string, captcha: string) {
    const captchaRedisKey = generateRedisKey(CAPTCHA_REDIS_KEY_PREFIX, id);
    const res = await this.redis.get(captchaRedisKey);
    if (isEmpty(res)) {
      throw new BusinessException(ErrorCodeEnum.EXPIRED_CAPTCHA);
    }
    if (captcha.toLowerCase() !== res.toLowerCase())
      throw new BusinessException(ErrorCodeEnum.INVALID_CAPTCHA);
    // 校验成功后移除验证码
    await this.redis.del(captchaRedisKey);
    return false;
  }

  async validateAccessToken(accessToken: string) {
    try {
      const res = await this.jwtService.verifyAsync<JwtPayload>(accessToken, {
        secret: this.configService.get('jwt.secret'),
      });
      if (res.sub.type !== 'access_token') {
        throw new BusinessException(ErrorCodeEnum.INVALID_TOKEN);
      }
      return res;
    } catch (error) {
      throw new BusinessException(ErrorCodeEnum.INVALID_TOKEN);
    }
  }
  async validateRefreshToken(refreshToken: string) {
    try {
      const res = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.get('jwt.refreshTokenSecret'),
      });
      if (res.sub.type !== 'refresh_token') {
        throw new BusinessException(ErrorCodeEnum.INVALID_REFRESH_TOKEN);
      }
      return res;
    } catch (error) {
      throw new BusinessException(ErrorCodeEnum.INVALID_REFRESH_TOKEN);
    }
  }
}
