import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@ultrack/libs';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import async from 'async';

@Injectable()
export class FileProcessorService {
  constructor(private configService: ConfigService<EnvironmentVariables>) {}
  async processFileAsync(
    user: string,
    fileName: string,
    file: Express.Multer.File,
  ): Promise<void> {
    initializeApp({
      projectId: this.configService.get('PROJECT_ID'),
    });
    const fitDecoder = await (eval(
      `import('@garmin-fit/sdk')`,
    ) as Promise<any>);
    const { Decoder, Stream } = fitDecoder;

    const buffer = Buffer.from(file.buffer);

    const stream = Stream.fromBuffer(buffer);

    const decoder = new Decoder(stream);
    console.log('isFIT (instance method): ' + decoder.isFIT());
    console.log('checkIntegrity: ' + decoder.checkIntegrity());

    const { messages, errors } = decoder.read();

    await this.uploadCollection(
      user,
      'records',
      fileName,
      messages.recordMesgs,
    );
    await this.uploadCollection(user, 'laps', fileName, messages.lapMesgs);
    await this.uploadCollection(
      user,
      'sessions',
      fileName,
      messages.sessionMesgs,
    );
    await this.uploadCollection(user, 'events', fileName, messages.eventMesgs);
    await this.uploadCollection(
      user,
      'activity',
      fileName,
      messages.activityMesgs,
    );
    await this.uploadCollection(
      user,
      'deviceInfo',
      fileName,
      messages.deviceInfoMesgs,
    );
    console.log('uploaded');
  }

  async deleteFileAsync(user: string, fileName: string) {
    initializeApp({
      projectId: this.configService.get('PROJECT_ID'),
    });
    const db = getFirestore();

    const docRef = db.collection(user).doc(fileName.replace(/\//g, '_'));

    await docRef.delete();
  }

  async uploadCollection(
    user: string,
    collection: string,
    fileName: string,
    data: any[],
    docIdField: string = 'timestamp',
  ): Promise<boolean> {
    try {
      const db = getFirestore();

      const collectionRef = db
        .collection(user)
        .doc(fileName.replace(/\//g, '_'))
        .collection(collection);

      const queue = async.queue(async (d: any) => {
        const docId =
          docIdField === 'timestamp'
            ? new Date(d.timestamp).getTime().toString()
            : d[docIdField];
        const docRef = collectionRef.doc(docId);
        await docRef.set(d);
      }, 1000);

      await queue.pushAsync(data);

      await queue.drain();

      console.log(collection + ' uploaded');

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}
