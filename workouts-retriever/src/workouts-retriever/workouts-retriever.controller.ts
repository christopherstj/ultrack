import { Controller } from '@nestjs/common';
import { WorkoutsRetrieverService } from './workouts-retriever.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('workouts-retriever')
export class WorkoutsRetrieverController {
  constructor(
    private readonly workoutsRetrieverService: WorkoutsRetrieverService,
  ) {}

  @MessagePattern('get-records')
  async getRecords(
    @Payload()
    data: {
      user: string;
      workoutId: string;
      values: string[];
      resolution?: number;
      startTime?: Date;
      endTime?: Date;
    },
  ) {
    const { user, workoutId, values, resolution, startTime, endTime } = data;
    const result = await this.workoutsRetrieverService.getRecordsById(
      user,
      workoutId,
      values,
      resolution,
      startTime,
      endTime,
    );
    return result;
  }

  @MessagePattern('get-lap-firestore-data')
  async getLapDataFromFirestore(
    @Payload() data: { user: string; workoutId: string },
  ) {
    const { user, workoutId } = data;
    const result = await this.workoutsRetrieverService.getLapsFromFirestoreById(
      user,
      workoutId,
    );
    return result;
  }

  @MessagePattern('get-session-firestore-data')
  async getSessionDataFromFirestore(
    @Payload() data: { user: string; workoutId: string },
  ) {
    const { user, workoutId } = data;
    const result = await this.workoutsRetrieverService.getSessionById(
      user,
      workoutId,
    );
    return result;
  }
}
