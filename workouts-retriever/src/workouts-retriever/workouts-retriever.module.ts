import { Module } from '@nestjs/common';
import { WorkoutsRetrieverController } from './workouts-retriever.controller';
import { WorkoutsRetrieverService } from './workouts-retriever.service';

@Module({
  controllers: [WorkoutsRetrieverController],
  providers: [WorkoutsRetrieverService],
})
export class WorkoutsRetrieverModule {}
