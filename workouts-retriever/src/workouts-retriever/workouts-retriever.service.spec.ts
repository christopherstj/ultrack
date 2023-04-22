import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutsRetrieverService } from './workouts-retriever.service';

describe('WorkoutsRetrieverService', () => {
  let service: WorkoutsRetrieverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkoutsRetrieverService],
    }).compile();

    service = module.get<WorkoutsRetrieverService>(WorkoutsRetrieverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
