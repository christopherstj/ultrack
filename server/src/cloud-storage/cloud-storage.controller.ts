import {
  Controller,
  Inject,
  Post,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Response,
  Delete,
  Param,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthorizedRequest, UploadMessageData } from '@ultrack/libs';
import { AuthGuard } from 'src/auth/auth.guard';
import { Express, Response as ExpressResponse } from 'express';
import { lastValueFrom } from 'rxjs';

@Controller('file-management')
export class CloudStorageController {
  constructor(
    @Inject('CLOUD_STORAGE_SERVICE') private storageClient: ClientProxy,
    @Inject('FILE_PROCESSOR_SERVICE') private fileProcessorClient: ClientProxy,
  ) {}

  @UseGuards(AuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: AuthorizedRequest,
  ) {
    const payload: UploadMessageData = {
      user: req.payload!.email,
      file,
    };
    const result = this.storageClient.send<{
      success: boolean;
      fileName: string;
    }>('/upload', payload);

    const { success, fileName } = await lastValueFrom(result);

    if (success) {
      this.fileProcessorClient.emit('/file-uploaded', {
        user: req.payload!.email,
        fileName,
        file,
      });
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':fileName')
  async deleteFile(
    @Param('fileName') fileName: string,
    @Request() req: AuthorizedRequest,
  ) {
    const result = this.storageClient.send<{
      success: boolean;
    }>('/delete', { user: req.payload!.email });

    const { success } = await lastValueFrom(result);

    if (success) {
      this.fileProcessorClient.emit('/file-deleted', {
        user: req.payload!.email,
        fileName,
      });
    }
  }
}
