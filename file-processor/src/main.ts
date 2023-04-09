import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { createLogger, EnvironmentVariables } from '@ultrack/libs';
import { initializeApp } from 'firebase-admin';

async function bootstrap() {
  const appConfig = await NestFactory.create(AppModule);
  const configService = appConfig.get(ConfigService<EnvironmentVariables>);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        port: 3003,
      },
      logger: WinstonModule.createLogger({
        instance: createLogger(
          configService.get('PROJECT_ID')!,
          'dev',
          'microservice-file-processor',
        ),
      }),
    },
  );
  await app.listen();
}
bootstrap();
