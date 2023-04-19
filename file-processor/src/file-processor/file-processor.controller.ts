import { Controller } from '@nestjs/common';
import { FileProcessorService } from './file-processor.service';
import { MessagePattern } from '@nestjs/microservices';
import { SuccessMessage } from '@ultrack/libs';

@Controller('file-processor')
export class FileProcessorController {
  constructor(private readonly fileProcessorService: FileProcessorService) {}

  @MessagePattern('/file-uploaded')
  async processFileRecordsAsync(data: {
    user: string;
    fileName: string;
    file: Express.Multer.File;
  }): Promise<SuccessMessage> {
    try {
      await this.fileProcessorService.processFileAsync(
        data.user,
        data.fileName,
        data.file,
      );

      return { success: true };
    } catch (err) {
      return { success: false };
    }
  }

  @MessagePattern('/file-deleted')
  async deleteFileRecordsAsync(data: {
    user: string;
    fileName: string;
  }): Promise<SuccessMessage> {
    try {
      await this.fileProcessorService.deleteFileAsync(data.user, data.fileName);

      return { success: true };
    } catch (err) {
      return { success: false };
    }
  }
}
