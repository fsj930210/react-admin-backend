import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AUTH_STRATEGY } from '../constants/auth.constants';
import { UserService } from '@/modules/user/user.service';
import { UserEntity } from '@/modules/user/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, AUTH_STRATEGY.LOCAL) {
  @Inject()
  private readonly userService: UserService;
  // 验证用户
  async validate(account: string, password: string): Promise<Omit<UserEntity, 'password'> | null> {
    const user = await this.userService.validateUser(account, password);
    return user;
  }
}
