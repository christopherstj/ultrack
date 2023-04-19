import { Module } from '@nestjs/common';
import { FileProcessorService } from './file-processor.service';
import { FileProcessorController } from './file-processor.controller';
import { ConfigModule } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [ConfigModule],
  providers: [
    FileProcessorService,
    {
      provide: 'WORKOUTS_SERVICE',
      useFactory: () => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: ['amqp://localhost:5672'],
            queue: 'workouts_queue',
            queueOptions: {
              durable: false,
            },
          },
        });
      },
      inject: [],
    },
  ],
  controllers: [FileProcessorController],
})
export class FileProcessorModule {}
