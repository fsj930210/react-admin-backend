import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import config from './config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from '@/interceptors/transform.interceptor';
import { LoggerInterceptor } from '@/interceptors/logger.interceptor';
import { TimeoutInterceptor } from '@/interceptors/timeout.interceptor';
import { AllExceptionsFilter } from '@/filters/all.exception.filter';
import { LoggerModule } from '@/shared/logger.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      expandVariables: true,
      load: [config],
    }),
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
  ],
})
export class AppModule {}
