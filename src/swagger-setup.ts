import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const configService = app.get(ConfigService);

  // 默认为启用
  const enable = configService.get<boolean>('swagger.enable', true);

  // 判断是否需要启用
  if (!enable) {
    return;
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle(configService.get<string>('swagger.title', 'react-admin后台管理系统API文档'))
    .setDescription(
      configService.get<string>('swagger.description', 'react-admin后台管理系统API文档'),
    )
    .setLicense('MIT', 'https://github.com/fsj930210/react-admin-backend')
    .addBearerAuth({
      type: 'http',
      description: '基于jwt的认证',
    })
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup(configService.get<string>('swagger.path', '/api-doc'), app, document);
}
