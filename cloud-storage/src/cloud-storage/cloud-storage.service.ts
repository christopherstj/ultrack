import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { EnvironmentVariables, UploadMessageData } from '@ultrack/libs';
import { Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudStorageService {
  constructor(private configService: ConfigService<EnvironmentVariables>) {}
  async uploadFile(data: UploadMessageData) {
    try {
      const now = new Date();

      const dateTimeString = this.getDateTimeString(now);

      const storage = new Storage({
        projectId: this.configService.get('PROJECT_ID'),
      });

      const fileName = `${data.user}/${dateTimeString}/${data.file.originalname}.fit`;

      const file = storage.bucket('dev-fit-file-bucket-f45f695').file(fileName);

      const [location] = await file.createResumableUpload();

      const options = {
        uri: location,
        resumable: true,
        validation: false,
      };

      await file.save(Buffer.from(data.file.buffer), options);
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
