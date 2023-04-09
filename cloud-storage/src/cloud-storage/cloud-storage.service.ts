import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { EnvironmentVariables, UploadMessageData } from '@ultrack/libs';
import { Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudStorageService {
  constructor(private configService: ConfigService<EnvironmentVariables>) {}
  async uploadFile(
    data: UploadMessageData,
  ): Promise<{ success: boolean; fileName: string }> {
    try {
      console.log('uploading data');
      const now = new Date();

      const dateTimeString = this.getDateTimeString(now);

      const storage = new Storage({
        projectId: this.configService.get('PROJECT_ID'),
      });

      const fileName = `${data.user}/${dateTimeString}/${data.file.originalname}`;

      const file = storage.bucket('dev-fit-file-bucket-f45f695').file(fileName);

      const [location] = await file.createResumableUpload();

      const options = {
        uri: location,
        resumable: true,
        validation: false,
      };

      await file.save(Buffer.from(data.file.buffer), options);

      return { success: true, fileName };
    } catch (err) {
      throw new RpcException('Upload file failed: ' + err);
    }
  }

  async deleteFile(
    user: string,
    fileName: string,
  ): Promise<{ success: boolean }> {
    try {
      const storage = new Storage({
        projectId: this.configService.get('PROJECT_ID'),
      });

      const fullFileName = `${user}/${fileName}`;

      const file = storage
        .bucket('dev-fit-file-bucket-f45f695')
        .file(fullFileName);

      const [exists] = await file.exists();

      if (!exists) throw new RpcException('Invalid file name');

      const [res] = await file.delete();

      if (res.statusCode !== 200) throw new RpcException('Error deleting file');

      return { success: true };
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
