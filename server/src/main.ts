import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { createLogger, EnvironmentVariables } from '@ultrack/libs';
import { ConfigService } from '@nestjs/config';

const bootstrap = async () => {
  const appConfig = await NestFactory.create(AppModule);
  const configService = appConfig.get(ConfigService<EnvironmentVariables>);

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({
      instance: createLogger(
        configService.get('PROJECT_ID')!,
        'dev',
        'http-server',
      ),
    }),
  });
  await app.listen(80);
};
bootstrap();
