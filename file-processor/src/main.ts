import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { createLogger, EnvironmentVariables } from '@ultrack/libs';
import * as admin from 'firebase-admin';

async function bootstrap() {
  const appConfig = await NestFactory.create(AppModule);
  const configService = appConfig.get(ConfigService<EnvironmentVariables>);
  admin.initializeApp({
    projectId: configService.get('PROJECT_ID'),
  });

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${process.env.RABBITMQ_IP || 'localhost'}:5672`],
        queue: 'file_processor_queue',
        queueOptions: {
          durable: false,
        },
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
