import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from './config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from '@/interceptors/transform.interceptor';
import { LoggerInterceptor } from '@/interceptors/logger.interceptor';
import { TimeoutInterceptor } from '@/interceptors/timeout.interceptor';
import { AllExceptionsFilter } from '@/filters/all.exception.filter';
import { LoggerModule } from '@/shared/logger/logger.module';
import { TypeOrmModule } from '@/shared/typeorm/typeorm.module';
import { RedisModule } from '@/shared/redis/redis.module';
import { UserModule } from './modules/user/user.module';
import { JwtAuthGuard } from './modules/auth/guard/jwt-auth.guard';
import { AuthModule } from './modules/auth/auth.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      expandVariables: true,
      load: [config],
    }),
    RedisModule,
    LoggerModule,
    TypeOrmModule,
    UserModule,
    AuthModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
