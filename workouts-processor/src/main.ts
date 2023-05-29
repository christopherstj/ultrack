import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables, createLogger } from '@ultrack/libs';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { WinstonModule } from 'nest-winston';
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
        urls: [`amqp://${process.env.RABBITMQ_IP}:5672`],
        queue: 'workouts_processor_queue',
        queueOptions: {
          durable: false,
        },
      },
      logger: WinstonModule.createLogger({
        instance: createLogger(
          configService.get('PROJECT_ID')!,
          'dev',
          'microservice-workouts-processor',
        ),
      }),
    },
  );
  await app.listen();
}
bootstrap();
