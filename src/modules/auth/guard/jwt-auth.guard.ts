import { ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import {
  AUTH_STRATEGY,
  JTI_KEY_PREFIX,
  TOKEN_BLACKLIST_KEY_PREFIX,
} from '../constants/auth.constants';
import { REDIS_CLIENT } from '@/constants/common.constant';
import { ExtractJwt } from 'passport-jwt';
import Redis from 'ioredis';
import { getErrorMessage } from '@/utils/utils';
import { ErrorCodeEnum } from '@/enum/error_code.enum';
import { AuthService } from '../auth.service';
import { PUBLIC_KEY } from '@/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard(AUTH_STRATEGY.JWT) {
  @Inject()
  private authService: AuthService;
  jwtFromRequestFn = ExtractJwt.fromAuthHeaderAsBearerToken();
  @Inject(REDIS_CLIENT) redis: Redis;
  constructor(private reflector: Reflector) {
    super();
  }
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // 如果是公开路由，直接返回 true
    if (isPublic) {
      return true;
    }
    // 获取token
    const token = this.jwtFromRequestFn(request);
    if (!token) {
      throw new UnauthorizedException(getErrorMessage(ErrorCodeEnum.INVALID_TOKEN));
    }
    // 验证token
    const payload = await this.authService.validateAccessToken(token);
    // 检查黑名单和jti有效性
    const [blacklisted, userId] = await Promise.all([
      this.redis.exists(`${TOKEN_BLACKLIST_KEY_PREFIX}${payload.jti}`),
      this.redis.get(`${JTI_KEY_PREFIX}${payload.jti}`),
    ]);
    // 黑名单直接抛出异常
    if (blacklisted || String(userId) !== String(payload.sub.userId)) {
      throw new UnauthorizedException(getErrorMessage(ErrorCodeEnum.INVALID_TOKEN));
    }
    let result: any = false;
    try {
      result = await super.canActivate(context);
    } catch (error) {
      throw new UnauthorizedException(getErrorMessage(ErrorCodeEnum.INVALID_TOKEN));
    }
    return result;
  }

  handleRequest(err, user, info) {
    // 您可以基于 "info" 或 "err" 参数抛一个错误
    if (err || !user) {
      throw err || new UnauthorizedException(getErrorMessage(ErrorCodeEnum.INVALID_TOKEN));
    }
    return user;
  }
}
