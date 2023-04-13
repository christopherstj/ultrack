import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFitness } from './user-fitness.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UserFitnessService {
  constructor(
    @InjectRepository(UserFitness)
    private userFitnessRepo: Repository<UserFitness>,
    private readonly configService: ConfigService,
  ) {}

  async getUserThreshold(email: string) {
    const user = await this.userFitnessRepo.findOne({
      where: {
        userId: email,
      },
    });

    return user.thresholdPace;
  }

  async setUserThreshold(email: string, threshold: number) {
    try {
      console.log(threshold);
      await this.userFitnessRepo.update(
        { userId: email },
        { thresholdPace: threshold },
      );

      return { success: true };
    } catch (err) {
      console.error(err);
      throw new RpcException('Error updating threshold: ' + err);
    }
  }
}
