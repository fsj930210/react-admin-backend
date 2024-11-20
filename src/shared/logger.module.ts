import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import { utilities } from 'nest-winston';
import 'winston-daily-rotate-file';

@Module({
  imports: [
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        level: configService.get('logger.level'),
        transports: [
          new winston.transports.DailyRotateFile({
            level: configService.get('logger.level'),
            dirname: configService.get('logger.dirname'),
            filename: configService.get('logger.filename'),
            datePattern: configService.get('logger.datePattern'),
            maxSize: configService.get('logger.maxSize'),
          }),
          new winston.transports.Console({
            format: winston.format.combine(winston.format.timestamp(), utilities.format.nestLike()),
          }),
          new winston.transports.Http({
            host: configService.get('logger.host'),
            port: configService.get('logger.port'),
            path: configService.get('logger.path'),
          }),
        ],
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class LoggerModule {}
