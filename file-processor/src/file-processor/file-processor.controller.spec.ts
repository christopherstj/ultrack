import { Test, TestingModule } from '@nestjs/testing';
import { FileProcessorController } from './file-processor.controller';

describe('FileProcessorController', () => {
  let controller: FileProcessorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileProcessorController],
    }).compile();

    controller = module.get<FileProcessorController>(FileProcessorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
