import { Test, TestingModule } from '@nestjs/testing';
import { UserFitnessController } from './user-fitness.controller';

describe('UserFitnessController', () => {
  let controller: UserFitnessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserFitnessController],
    }).compile();

    controller = module.get<UserFitnessController>(UserFitnessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
