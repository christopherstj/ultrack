import {
  Controller,
  Inject,
  Post,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthorizedRequest, UploadMessageData } from '@ultrack/libs';
import { AuthGuard } from 'src/auth/auth.guard';
import { Express } from 'express';

@Controller('file-management')
export class CloudStorageController {
  constructor(@Inject('CLOUD_STORAGE_SERVICE') private client: ClientProxy) {}

  @UseGuards(AuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: AuthorizedRequest,
  ) {
    const payload: UploadMessageData = {
      user: req.payload!.email,
      file,
    };
    this.client.emit('/upload', payload);
  }
}
