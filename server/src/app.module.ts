import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { UsersController } from './users/users.controller';
import { CloudStorageController } from './cloud-storage/cloud-storage.controller';
import { JwtModule } from '@nestjs/jwt';
import { EnvironmentVariables } from '@ultrack/libs';
import { WorkoutsController } from './workouts/workouts.controller';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot(
      process.env.NODE_ENV === 'production'
        ? {
            load: [
              () => ({
                MYSQL_HOST: process.env.MYSQL_HOST,
                MYSQL_USER_NAME: process.env.MYSQL_USER_NAME,
                MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
                MYSQL_DB: process.env.MYSQL_DB,
                JWT_SECRET: process.env.JWT_SECRET,
              }),
            ],
          }
        : {
            envFilePath: ['.env.development.local', '.env.development', '.env'],
          },
    ),
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    UsersController,
    CloudStorageController,
    WorkoutsController,
    AppController,
  ],
  providers: [
    Logger,
    {
      provide: 'USERS_SERVICE',
      useFactory: () => {
        return ClientProxyFactory.create({
          options: {
            urls: [`amqp://${process.env.RABBITMQ_IP}:5672`],
            queue: 'users_queue',
            queueOptions: {
              durable: false,
            },
          },
          transport: Transport.RMQ,
        });
      },
      inject: [],
    },
    {
      provide: 'CLOUD_STORAGE_SERVICE',
      useFactory: () => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [`amqp://${process.env.RABBITMQ_IP}:5672`],
            queue: 'cloud_storage_queue',
            queueOptions: {
              durable: false,
            },
          },
        });
      },
      inject: [],
    },
    {
      provide: 'FILE_PROCESSOR_SERVICE',
      useFactory: () => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [`amqp://${process.env.RABBITMQ_IP}:5672`],
            queue: 'file_processor_queue',
            queueOptions: {
              durable: false,
            },
          },
        });
      },
      inject: [],
    },
    {
      provide: 'WORKOUTS_PROCESSOR_SERVICE',
      useFactory: () => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [`amqp://${process.env.RABBITMQ_IP}:5672`],
            queue: 'workouts_processor_queue',
            queueOptions: {
              durable: false,
            },
          },
        });
      },
      inject: [],
    },
    {
      provide: 'WORKOUTS_RETRIEVER_SERVICE',
      useFactory: () => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [`amqp://${process.env.RABBITMQ_IP}:5672`],
            queue: 'workouts_retriever_queue',
            queueOptions: {
              durable: false,
            },
          },
        });
      },
      inject: [],
    },
  ],
})
export class AppModule {}
