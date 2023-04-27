import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  FitnessDayModel,
  LapModel,
  LocalUserModel,
  UserFitnessModel,
  WorkoutModel,
} from '@ultrack/libs';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      LocalUserModel,
      UserFitnessModel,
      WorkoutModel,
      LapModel,
      FitnessDayModel,
    ]),
  ],
  exports: [],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
