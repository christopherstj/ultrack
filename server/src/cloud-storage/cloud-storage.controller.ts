import {
  Controller,
  Inject,
  Post,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Delete,
  Param,
  Res,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthorizedRequest, UploadMessageData } from '@ultrack/libs';
import { AuthGuard } from 'src/auth/auth.guard';
import { Express, Response } from 'express';
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
    @Res() res: Response,
  ) {
    const payload: UploadMessageData = {
      user: req.payload!.email,
      file,
    };
    const res1 = this.storageClient.send<{
      success: boolean;
      fileName: string;
    }>('/upload', payload);

    const result1 = await lastValueFrom(res1);

    if (result1.success) {
      const res2 = this.fileProcessorClient.send<{
        success: boolean;
      }>('/file-uploaded', {
        user: req.payload!.email,
        fileName: result1.fileName,
        file,
      });

      const result2 = await lastValueFrom(res2);

      if (result2.success) {
        res.send(result2);
      } else {
        res.status(500).send('Error uploading file');
      }
    } else {
      res.status(500).send('Error uploading file');
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':fileName')
  async deleteFile(
    @Param('fileName') fileName: string,
    @Request() req: AuthorizedRequest,
    @Res() res: Response,
  ) {
    const res1 = this.storageClient.send<{
      success: boolean;
    }>('/delete', { user: req.payload!.email, fileName });

    const result1 = await lastValueFrom(res1);

    if (result1.success) {
      const res2 = this.fileProcessorClient.send<{
        success: boolean;
      }>('/file-deleted', {
        user: req.payload!.email,
        fileName,
      });

      const result2 = await lastValueFrom(res2);

      if (result2.success) {
        res.send(result2);
      } else {
        res.status(500).send('Error deleting file');
      }
    } else {
      res.status(500).send('Error deleting file');
    }
  }
}
