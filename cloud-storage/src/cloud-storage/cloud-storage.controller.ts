import { Controller } from '@nestjs/common';
import {
  EventPattern,
  MessagePattern,
  RpcException,
} from '@nestjs/microservices';
import { CloudStorageService } from './cloud-storage.service';
import { UploadMessageData } from '@ultrack/libs';

@Controller('cloud-storage')
export class CloudStorageController {
  constructor(private readonly cloudStorageService: CloudStorageService) {}

  @MessagePattern('/upload')
  async uploadFileAsync(
    data: UploadMessageData,
  ): Promise<{ success: boolean; fileName: string }> {
    const result = await this.cloudStorageService.uploadFile(data);
    if (result) return result;
    return { success: false, fileName: '' };
  }

  @MessagePattern('/delete')
  async deleteFileAsync(data: {
    user: string;
    fileName: string;
  }): Promise<{ success: boolean }> {
    const result = await this.cloudStorageService.deleteFile(
      data.user,
      data.fileName,
    );
    if (result) return result;
    return { success: false };
  }
}
