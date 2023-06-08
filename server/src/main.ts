import { NestFactory } from '@nestjs/core';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { createLogger, EnvironmentVariables } from '@ultrack/libs';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';
import * as http from 'http';
import * as express from 'express';
import certManager from '@google-cloud/certificate-manager';

const bootstrap = async () => {
  const appConfig = await NestFactory.create(AppModule);
  const configService = appConfig.get(ConfigService<EnvironmentVariables>);

  const server = express();

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
    {
      logger: WinstonModule.createLogger({
        instance: createLogger(
          configService.get('PROJECT_ID')!,
          'dev',
          'http-server',
        ),
      }),
    },
  );

  await app.init();

  http.createServer(server).listen(80);
};
bootstrap();
