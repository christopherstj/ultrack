import { Module } from '@nestjs/common';
import { WorkoutProcessorController } from './workout-processor.controller';
import { WorkoutProcessorService } from './workout-processor.service';

@Module({
  controllers: [WorkoutProcessorController],
  providers: [WorkoutProcessorService]
})
export class WorkoutProcessorModule {}
