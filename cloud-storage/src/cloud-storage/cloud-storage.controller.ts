import { Controller } from '@nestjs/common';
import {
  EventPattern,
  MessagePattern,
  RpcException,
} from '@nestjs/microservices';
import { CloudStorageService } from './cloud-storage.service';
import { UploadMessageData } from '@ultrack/libs';

@Controller()
export class CloudStorageController {
  constructor(private readonly cloudStorageService: CloudStorageService) {}

  @EventPattern('/upload')
  async uploadFileAsync(data: UploadMessageData): Promise<void> {
    await this.cloudStorageService.uploadFile(data);
  }
}
