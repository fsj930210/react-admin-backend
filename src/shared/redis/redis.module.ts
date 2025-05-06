import { Global, Module } from '@nestjs/common';
import { RedisModule as NestRedisModule, RedisService } from '@liaoliaots/nestjs-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { REDIS_CLIENT } from '@/constants/common.constant';

@Global()
@Module({
  imports: [
    NestRedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        readyLog: true,
        config: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          password: configService.get('redis.password'),
          db: +configService.get('redis.db'),
          keyPrefix: configService.get('redis.keyPrefix'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (redisService: RedisService) => {
        return redisService.getOrThrow();
      },
      inject: [RedisService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
