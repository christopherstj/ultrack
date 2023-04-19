import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import {
  EnvironmentVariables,
  SuccessMessage,
  UploadMessageData,
} from '@ultrack/libs';
import { Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CloudStorageService {
  constructor(
    @Inject('FILE_PROCESSOR_SERVICE') private fileProcessorClient: ClientProxy,
    private configService: ConfigService<EnvironmentVariables>,
  ) {}
  async uploadFile(
    data: UploadMessageData,
  ): Promise<SuccessMessage & { fileName: string }> {
    try {
      console.log('uploading data');

      const storage = new Storage({
        projectId: this.configService.get('PROJECT_ID'),
      });

      const file = storage
        .bucket('dev-fit-file-bucket-f45f695')
        .file(`${data.user}/${data.file.originalname}`);

      const [location] = await file.createResumableUpload();

      const options = {
        uri: location,
        resumable: true,
        validation: false,
      };

      await file.save(Buffer.from(data.file.buffer), options);

      const res = this.fileProcessorClient.send<SuccessMessage>(
        '/file-uploaded',
        {
          user: data.user,
          fileName: data.file.originalname,
          file: data.file,
        },
      );

      const { success } = await lastValueFrom(res);

      return { success, fileName: data.file.originalname };
    } catch (err) {
      throw new RpcException('Upload file failed: ' + err);
    }
  }

  async deleteFile(user: string, fileName: string): Promise<SuccessMessage> {
    try {
      const storage = new Storage({
        projectId: this.configService.get('PROJECT_ID'),
      });

      console.log(fileName);

      const fullFileName = `${user}/${fileName}`;

      const file = storage
        .bucket('dev-fit-file-bucket-f45f695')
        .file(fullFileName);

      const [exists] = await file.exists();

      if (!exists) throw new RpcException('Invalid file name');

      const [res] = await file.delete();

      console.log('file deleted from cloud storage');

      const result = this.fileProcessorClient.send<{
        success: boolean;
      }>('/file-deleted', {
        user,
        fileName,
      });

      const { success } = await lastValueFrom(result);

      return { success };
    } catch (err) {
      throw new RpcException('Upload file failed: ' + err);
    }
  }

  getDateTimeString(date: Date) {
    return `${date.getUTCFullYear()}-${
      date.getUTCMonth() < 10 ? `0${date.getUTCMonth()}` : date.getUTCMonth()
    }-${date.getUTCDate() < 10 ? `0${date.getUTCDate()}` : date.getUTCDate()}-${
      date.getUTCHours() < 10 ? `0${date.getUTCHours()}` : date.getUTCHours()
    }-${
      date.getUTCMinutes() < 10
        ? `0${date.getUTCMinutes()}`
        : date.getUTCMinutes()
    }-${
      date.getUTCSeconds() < 10
        ? `0${date.getUTCSeconds()}`
        : date.getUTCSeconds()
    }`;
  }
}
