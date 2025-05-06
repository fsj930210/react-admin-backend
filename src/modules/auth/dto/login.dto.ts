import { IsBoolean, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  // 登录账号（支持用户名或邮箱）
  @IsString()
  @Matches(/^(?:[a-zA-Z][a-zA-Z0-9\-._]{3,31}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/, {
    message: '请输入有效的用户名或邮箱地址',
  })
  account: string;
  // 密码规则 密码只能包含字母、数字和特殊字符(!@#$%^&*~_-)，长度6-32
  @IsString()
  @MinLength(6, { message: '密码长度不能小于6位' })
  @MaxLength(32, { message: '密码长度不能大于32位' })
  @Matches(/^[\w!@#$%^&*~\-]{6,32}$/, {
    message: '密码只能包含字母、数字和特殊字符(!@#$%^&*~_-)，长度6-32位',
  })
  password: string;
  @IsString()
  @IsOptional()
  captcha: string;
  @IsString()
  @IsOptional()
  captcha_id: string;
  @IsBoolean()
  @IsOptional()
  remember: boolean;
}
