import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { AUTH_STRATEGY } from '../constants/auth.constants';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interface/jwt.payload';
import { Request } from 'express';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, AUTH_STRATEGY.JWT) {
  constructor(@Inject(ConfigService) private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    return payload;
  }
}
