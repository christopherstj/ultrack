import { Module } from '@nestjs/common';
import { WorkoutsController } from './workouts.controller';
import { WorkoutsService } from './workouts.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workout } from '@ultrack/libs';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Workout])],
  controllers: [WorkoutsController],
  providers: [
    WorkoutsService,
    {
      provide: 'USERS_SERVICE',
      useFactory: () => {
        return ClientProxyFactory.create({
          options: {
            urls: ['amqp://localhost:5672'],
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
  ],
})
export class WorkoutsModule {}
