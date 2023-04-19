import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { WorkoutsService } from './workouts.service';
import { SuccessMessage } from '@ultrack/libs';

@Controller('workouts')
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @EventPattern('process-workout')
  async getWorkoutAsync(
    @Payload() data: { user: string; workoutId: string },
  ): Promise<SuccessMessage> {
    const result = await this.workoutsService.computeWorkout(
      data.user,
      data.workoutId,
    );
    return result;
  }

  @MessagePattern('get-laps')
  async getLapsAsync(@Payload() data: { user: string; workoutId: string }) {
    // const result = await this.workoutsService.getLapsById(
    //   data.user,
    //   data.workoutId,
    // );
    // return result;
  }
}
