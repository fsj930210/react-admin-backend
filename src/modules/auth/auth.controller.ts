import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '@/decorators/public.decorator';
import { CaptchaDto } from './dto/captcha.dto';
import { Response, Request } from 'express';
import { Cookie } from '@/decorators/cookie.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(loginDto, res);
  }
  @Public()
  @Get('captcha')
  getCaptcha(@Query() captchaDto: CaptchaDto) {
    return this.authService.generateSvgCaptcha(captchaDto);
  }
  @Post('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const jti = req.user['jti'];
    return this.authService.logout(jti, res);
  }
  @Post('refresh-token')
  refreshToken(@Cookie('refresh_token') token: string, @Res({ passthrough: true }) res: Response) {
    return this.authService.refreshToken(token, res);
  }
}
