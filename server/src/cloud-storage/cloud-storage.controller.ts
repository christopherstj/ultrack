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
import {
  AuthorizedRequest,
  SuccessMessage,
  UploadMessageData,
} from '@ultrack/libs';
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
    const result = this.storageClient.send<
      SuccessMessage & { fileName: string }
    >('/upload', payload);

    const { success, fileName } = await lastValueFrom(result);

    if (success) {
      res.send({ success, fileName });
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
    const result = this.storageClient.send<SuccessMessage>('/delete', {
      user: req.payload!.email,
      fileName,
    });

    const { success } = await lastValueFrom(result);

    if (success) {
      res.send({ success });
    } else {
      res.status(500).send('Error deleting file');
    }
  }
}
