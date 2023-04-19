import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { createLogger, EnvironmentVariables } from '@ultrack/libs';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const appConfig = await NestFactory.create(AppModule);
  const configService = appConfig.get(ConfigService<EnvironmentVariables>);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'users_queue',
        queueOptions: {
          durable: false,
        },
      },
      logger: WinstonModule.createLogger({
        instance: createLogger(
          configService.get('PROJECT_ID')!,
          'dev',
          'microservice-users',
        ),
      }),
    },
  );
  await app.listen();
}
bootstrap();
