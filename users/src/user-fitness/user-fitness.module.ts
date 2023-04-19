import { Module } from '@nestjs/common';
import { UserFitnessService } from './user-fitness.service';
import { UserFitnessController } from './user-fitness.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFitness } from '@ultrack/libs';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([UserFitness])],
  exports: [UserFitnessService],
  providers: [UserFitnessService],
  controllers: [UserFitnessController],
})
export class UserFitnessModule {}
