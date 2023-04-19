import { Test, TestingModule } from '@nestjs/testing';
import { UserFitnessService } from './user-fitness.service';

describe('UserFitnessService', () => {
  let service: UserFitnessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserFitnessService],
    }).compile();

    service = module.get<UserFitnessService>(UserFitnessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
