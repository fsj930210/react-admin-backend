import { BaseEntity } from '@/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({
  name: 'user',
})
export class UserEntity extends BaseEntity {
  @Column({
    length: 64,
    comment: '用户名',
    unique: true,
  })
  username: string;
  @Column({
    length: 32,
    comment: '密码',
  })
  password: string;
  @Column({
    length: 64,
    comment: '昵称',
  })
  nickname: string;
  @Column({
    length: 50,
    comment: '邮箱',
    unique: true,
  })
  email: string;
  @Column({
    length: 100,
    comment: '头像',
    nullable: true,
  })
  avatar: string;
  @Column({
    length: 20,
    comment: '手机号',
    nullable: true,
  })
  phone: string;
  @Column({
    type: 'tinyint',
    comment: '性别 1-男 2-女 3-未知',
    default: 3,
  })
  gender: number;
  @Column({
    comment: '状态 1-启用 2-禁用',
    type: 'tinyint',
    default: 1,
  })
  status: number;
  @Column({
    length: 256,
    comment: '备注',
    nullable: true,
  })
  remark: string;
}
