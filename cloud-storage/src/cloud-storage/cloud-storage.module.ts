import { Module } from '@nestjs/common';
import { CloudStorageService } from './cloud-storage.service';
import { CloudStorageController } from './cloud-storage.controller';
import { ConfigModule } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [ConfigModule],
  providers: [
    CloudStorageService,
    {
      provide: 'FILE_PROCESSOR_SERVICE',
      useFactory: () => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [`amqp://${process.env.RABBITMQ_IP || 'localhost'}:5672`],
            queue: 'file_processor_queue',
            queueOptions: {
              durable: false,
            },
          },
        });
      },
      inject: [],
    },
  ],
  controllers: [CloudStorageController],
})
export class CloudStorageModule {}
