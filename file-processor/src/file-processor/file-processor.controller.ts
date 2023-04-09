import { Controller } from '@nestjs/common';
import { FileProcessorService } from './file-processor.service';
import { EventPattern } from '@nestjs/microservices';
import { Express } from 'express';

@Controller('file-processor')
export class FileProcessorController {
  constructor(private readonly fileProcessorService: FileProcessorService) {}

  @EventPattern('/file-uploaded')
  async processFileRecordsAsync(data: {
    user: string;
    fileName: string;
    file: Express.Multer.File;
  }): Promise<void> {
    await this.fileProcessorService.processFileAsync(
      data.user,
      data.fileName,
      data.file,
    );
  }

  @EventPattern('/file-deleted')
  async deleteFileRecordsAsync(data: {
    user: string;
    fileName: string;
  }): Promise<void> {
    await this.fileProcessorService.deleteFileAsync(data.user, data.fileName);
  }
}
