import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutProcessorController } from './workout-processor.controller';

describe('WorkoutProcessorController', () => {
  let controller: WorkoutProcessorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutProcessorController],
    }).compile();

    controller = module.get<WorkoutProcessorController>(WorkoutProcessorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
