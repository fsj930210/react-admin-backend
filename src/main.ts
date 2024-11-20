import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from '@/swagger-setup';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

declare const module: any;
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix(configService.get('app.prefix'));
  app.useStaticAssets('assets', {
    prefix: configService.get('app.assetsPrefix'),
  });
  // 全局pipe
  app.useGlobalPipes(
    new ValidationPipe({
      // 去除类上不存在的字段
      whitelist: true,
      // 配置后所有的负载对象转换(Transform) 隐式进行
      //  transform: true,
    }),
  );
  // 日志替换
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  // 接口版本控制
  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI,
  });
  setupSwagger(app);
  await app.listen(configService.get('app.port') ?? 3000);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap().then(() => {
  console.log(`Server is running`);
});
