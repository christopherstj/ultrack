import { Module } from '@nestjs/common';
import { WorkoutsController } from './workouts.controller';
import { WorkoutsService } from './workouts.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workout } from './workout.entity';
import { UserFitness } from '../user-fitness/user-fitness.entity';
import { UserFitnessModule } from 'src/user-fitness/user-fitness.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Workout, UserFitness]),
    UserFitnessModule,
  ],
  controllers: [WorkoutsController],
  providers: [WorkoutsService],
})
export class WorkoutsModule {}
