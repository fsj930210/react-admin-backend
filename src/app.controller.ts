import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    console.log(this.configService.get('mysql.host'));
    return this.appService.getHello();
  }
  @Get('2')
  getHello2(): string {
    return 'hello2';
  }
}
