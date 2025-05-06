import { OmitType } from '@nestjs/swagger';
import { UserEntity } from '../entities/user.entity';

export class UserVo extends OmitType(UserEntity, ['password'] as const) {}
