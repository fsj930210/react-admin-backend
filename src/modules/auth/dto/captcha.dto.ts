import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class CaptchaDto {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly width: number = 100;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly height: number = 50;
}
