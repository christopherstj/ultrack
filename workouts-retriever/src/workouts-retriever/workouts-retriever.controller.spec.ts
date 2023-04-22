import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutsRetrieverController } from './workouts-retriever.controller';

describe('WorkoutsRetrieverController', () => {
  let controller: WorkoutsRetrieverController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutsRetrieverController],
    }).compile();

    controller = module.get<WorkoutsRetrieverController>(WorkoutsRetrieverController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
