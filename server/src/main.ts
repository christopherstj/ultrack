import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { logger } from './logging/logger';

const bootstrap = async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({
      instance: logger,
    }),
  });
  await app.listen(3000);
};
bootstrap();
