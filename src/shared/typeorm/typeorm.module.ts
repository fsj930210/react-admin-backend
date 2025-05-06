import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule as NestTypeOrmModule } from '@nestjs/typeorm';
import { WinstonLogger, WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { CustomTypeOrmLogger } from './typeorm.logger';

@Module({
  imports: [
    NestTypeOrmModule.forRootAsync({
      useFactory(configService: ConfigService, logger: WinstonLogger) {
        return {
          type: 'mysql',
          host: configService.get('mysql.host'),
          port: configService.get('mysql.port'),
          username: configService.get('mysql.username'),
          password: configService.get('mysql.password'),
          database: configService.get('mysql.database'),
          synchronize: configService.get('mysql.synchronize'),
          logging: configService.get('mysql.logging'),
          timezone: configService.get('mysql.timezone'),
          logger: new CustomTypeOrmLogger(logger),
          autoLoadEntities: true,
          poolSize: 10,
          connectorPackage: 'mysql2',
        };
      },
      inject: [ConfigService, WINSTON_MODULE_NEST_PROVIDER],
    }),
  ],
})
export class TypeOrmModule {}
