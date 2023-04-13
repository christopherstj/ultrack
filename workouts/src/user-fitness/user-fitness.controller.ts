import { Controller } from '@nestjs/common';
import { UserFitnessService } from './user-fitness.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('user-fitness')
export class UserFitnessController {
  constructor(private readonly userFitnessService: UserFitnessService) {}

  @MessagePattern('get-threshold')
  async getUserThresholdPace(@Payload() data: { user: string }) {
    const result = await this.userFitnessService.getUserThreshold(data.user);
    return result;
  }

  @MessagePattern('set-threshold')
  async setUserThresholdPace(
    @Payload() data: { user: string; threshold: number },
  ) {
    const result = await this.userFitnessService.setUserThreshold(
      data.user,
      data.threshold,
    );
    return result;
  }
}
