import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WorkoutsService } from './workouts.service';

@Controller('workouts')
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @MessagePattern('get-workout')
  async getWorkoutAsync(@Payload() data: { user: string; workoutId: string }) {
    const result = await this.workoutsService.getWorkout(
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
