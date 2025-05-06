import { Module } from '@nestjs/common';
import { UserModule } from '@/modules/user/user.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
// import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      useFactory: (configService) => {
        console.log('secret', configService.get('jwt.secret'));
        return {
          secret: configService.get('jwt.secret'),
          signOptions: {
            expiresIn: configService.get('jwt.expiresIn'),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [LocalStrategy, JwtStrategy, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
