import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutProcessorService } from './workout-processor.service';

describe('WorkoutProcessorService', () => {
  let service: WorkoutProcessorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkoutProcessorService],
    }).compile();

    service = module.get<WorkoutProcessorService>(WorkoutProcessorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
