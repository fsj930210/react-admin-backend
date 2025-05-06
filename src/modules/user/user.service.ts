import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { md5 } from '@/utils/md5';
import { USER_STATUS_ENUM } from './constants/user.constants';
import { isEmpty } from 'lodash-es';
import { BusinessException } from '@/exceptions/business.exception';
import { ErrorCodeEnum } from '@/enum/error_code.enum';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { isEmail } from 'class-validator';
import { UserVo } from './vo/user.vo';
import { REDIS_CLIENT } from '@/constants/common.constant';

@Injectable()
export class UserService {
  private logger = new Logger();
  @Inject(REDIS_CLIENT)
  private readonly redis: Redis;
  @Inject()
  private readonly configService: ConfigService;
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;
  // 验证用户
  async validateUser(account: string, password: string): Promise<UserVo | null> {
    let user: UserEntity;
    if (isEmail(account)) {
      user = await this.validateUserExistByEmail(account);
    } else {
      user = await this.validateUserExistByUsername(account);
    }
    await this.validatePassword(user.password, password);
    if (user) {
      const { password, ...result } = user;
      return result as UserVo;
    }
    return null;
  }
  // 通过用户名验证用户是否存在
  async validateUserExistByUsername(username: string): Promise<UserEntity> {
    const user = await this.findUserByUsername(username);
    if (!isEmpty(user)) {
      return user;
    }
    throw new BusinessException(ErrorCodeEnum.USER_NOT_FOUND);
  }
  // 通过邮箱验证用户是否存在
  async validateUserExistByEmail(email: string): Promise<UserEntity> {
    const user = await this.findUserByEmail(email);
    if (!isEmpty(user)) {
      return user;
    }
    throw new BusinessException(ErrorCodeEnum.USER_NOT_FOUND);
  }
  // 验证密码
  async validatePassword(userPassword: string, inputPassword: string): Promise<boolean> {
    const comparePassword = md5(`${inputPassword}`);
    if (userPassword !== comparePassword) {
      throw new BusinessException(ErrorCodeEnum.INVALID_USERNAME_PASSWORD);
    }
    return true;
  }
  async initData() {
    const superadmin = new UserEntity();
    superadmin.username = 'superadmin';
    superadmin.password = md5('superadmin123');
    superadmin.email = 'xxx@xx.com';
    superadmin.nickname = '超级管理员';
    superadmin.remark = '系统创建的超级管理员，不可删除';
    superadmin.createBy = -1;
    superadmin.updateBy = -1;
    const admin = new UserEntity();
    admin.username = 'admin';
    admin.password = md5('admin123');
    admin.email = 'yy@yy.com';
    admin.nickname = '管理员';
    superadmin.remark = '系统创建的管理员，不可删除';
    superadmin.createBy = -1;
    superadmin.updateBy = -1;
    await this.userRepository.save([superadmin, admin]);
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
  findUserByUsername(username: string) {
    return this.userRepository.findOne({ where: { username, status: USER_STATUS_ENUM.ENABLED } });
  }
  findUserByEmail(email: string) {
    return this.userRepository.findOne({ where: { email, status: USER_STATUS_ENUM.ENABLED } });
  }
  findUserById(id: number) {
    return this.userRepository.findOne({ where: { id, status: USER_STATUS_ENUM.ENABLED } });
  }
}
