import { Module } from '@nestjs/common';
import { WorkoutsController } from './workouts.controller';
import { WorkoutsService } from './workouts.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  FitnessDayModel,
  LapModel,
  LocalUserModel,
  UserFitnessModel,
  WorkoutModel,
} from '@ultrack/libs';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      LocalUserModel,
      UserFitnessModel,
      WorkoutModel,
      LapModel,
      FitnessDayModel,
    ]),
  ],
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
    {
      provide: 'WORKOUTS_RETRIEVER_SERVICE',
      useFactory: () => {
        return ClientProxyFactory.create({
          options: {
            urls: ['amqp://localhost:5672'],
            queue: 'workouts_retriever_queue',
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
