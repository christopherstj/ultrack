import { Controller } from '@nestjs/common';
import { UserFitnessService } from './user-fitness.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SuccessMessage } from '@ultrack/libs';

@Controller('user-fitness')
export class UserFitnessController {
  constructor(private readonly userFitnessService: UserFitnessService) {}

  @MessagePattern('set-units')
  async setUnits(
    @Payload() data: { user: string; units: string },
  ): Promise<SuccessMessage> {
    const result = await this.userFitnessService.setUserUnits(
      data.user,
      data.units,
    );
    return result;
  }

  @MessagePattern('get-units')
  async getUnits(@Payload() data: { user: string }): Promise<string> {
    const result = await this.userFitnessService.getUserUnits(data.user);
    return result;
  }

  @MessagePattern('get-threshold')
  async getUserThresholdPace(
    @Payload() data: { user: string },
  ): Promise<number> {
    const result = await this.userFitnessService.getUserThreshold(data.user);
    return result;
  }

  @MessagePattern('set-threshold')
  async setUserThresholdPace(
    @Payload() data: { user: string; threshold: number },
  ): Promise<SuccessMessage> {
    const result = await this.userFitnessService.setUserThreshold(
      data.user,
      data.threshold,
    );
    return result;
  }
}
