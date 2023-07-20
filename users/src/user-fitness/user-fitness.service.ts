import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';
import { SuccessMessage, UserFitnessModel } from '@ultrack/libs';

@Injectable()
export class UserFitnessService {
  constructor(
    @InjectRepository(UserFitnessModel)
    private userFitnessRepo: Repository<UserFitnessModel>,
    private readonly configService: ConfigService,
  ) {}

  async createUserDetailsIfNotExists(email: string): Promise<void> {
    try {
      const userFitness = await this.userFitnessRepo.findOne({
        where: {
          userId: email,
        },
      });

      if (!userFitness) {
        await this.userFitnessRepo.insert({ userId: email });
        return;
      } else {
        return;
      }
    } catch (err) {
      throw new RpcException(err);
    }
  }

  async getUserThreshold(email: string): Promise<number> {
    try {
      await this.createUserDetailsIfNotExists(email);
      const user = await this.userFitnessRepo.findOne({
        where: {
          userId: email,
        },
      });
      return user.thresholdPace;
    } catch (err) {
      throw new RpcException(err);
    }
  }

  async setUserThreshold(
    email: string,
    threshold: number,
  ): Promise<SuccessMessage> {
    try {
      await this.createUserDetailsIfNotExists(email);
      await this.userFitnessRepo.update(
        { userId: email },
        { thresholdPace: threshold },
      );

      return { success: true };
    } catch (err) {
      throw new RpcException(err);
    }
  }

  async setUserUnits(email: string, units: string): Promise<SuccessMessage> {
    try {
      await this.createUserDetailsIfNotExists(email);
      await this.userFitnessRepo.update({ userId: email }, { units });

      return { success: true };
    } catch (err) {
      throw new RpcException(err);
    }
  }

  async getUserUnits(email: string): Promise<string> {
    try {
      await this.createUserDetailsIfNotExists(email);
      const user = await this.userFitnessRepo.findOne({
        where: {
          userId: email,
        },
      });

      return user.units;
    } catch (err) {
      throw new RpcException(err);
    }
  }
}
