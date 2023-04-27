import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables, Lap, SuccessMessage } from '@ultrack/libs';
import { getFirestore } from 'firebase-admin/firestore';
import async from 'async';
import { ClientProxy, RpcException } from '@nestjs/microservices';

@Injectable()
export class FileProcessorService {
  constructor(
    @Inject('WORKOUTS_PROCESSOR_SERVICE') private workoutsService: ClientProxy,
    private configService: ConfigService<EnvironmentVariables>,
  ) {}

  async processFileAsync(
    user: string,
    fileName: string,
    file: Express.Multer.File,
  ): Promise<void> {
    try {
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

      this.processRecords(messages.recordMesgs);

      console.log(messages.recordMesgs.length);

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
      await this.uploadCollection(
        user,
        'events',
        fileName,
        messages.eventMesgs,
      );
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

      this.workoutsService.emit('process-workout', {
        user,
        workoutId: fileName,
      });
    } catch (err) {
      console.error(err);
      throw new RpcException(`Error uploading file ${fileName}: ${err}`);
    }
  }

  async deleteFileAsync(user: string, fileName: string) {
    try {
      const db = getFirestore();

      console.log(fileName);

      const docRef = db.collection(user).doc(fileName);

      const collectionRefs = await docRef.listCollections();

      const promises = collectionRefs.map(async (collectionRef) => {
        const query = collectionRef.orderBy('__name__').limit(400);

        return new Promise((resolve, reject) => {
          this.deleteQueryBatch(db, query, resolve).catch(reject);
        });
      });

      await Promise.all(promises);

      await docRef.delete();

      console.log('data deleted from firestore');
    } catch (err) {
      console.error(err);
      throw new RpcException(`Error deleteing file ${fileName}: ${err}`);
    }
  }

  async deleteQueryBatch(db, query, resolve) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
      resolve();
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    process.nextTick(() => {
      this.deleteQueryBatch(db, query, resolve);
    });
  }

  async uploadCollection<T>(
    user: string,
    collection: string,
    fileName: string,
    data: T[],
    docIdField: string = 'timestamp',
  ): Promise<SuccessMessage> {
    try {
      const db = getFirestore();

      const collectionRef = db
        .collection(user)
        .doc(fileName.replace(/\//g, '_'))
        .collection(collection);

      const queue = async.queue(async (batchData: any[]) => {
        const batch = db.batch();
        batchData.forEach((d) => {
          const docId =
            docIdField === 'timestamp'
              ? new Date(d.timestamp).getTime().toString()
              : d[docIdField];
          const docRef = collectionRef.doc(docId);
          batch.set(docRef, d);
        });
        await batch.commit();
      }, 1000);

      const chunks = data.reduce(
        (prev, curr) => {
          var group = prev.pop();
          if (group.length === 400) {
            prev.push(group);
            group = [];
          }
          group.push(curr);
          prev.push(group);
          return prev;
        },
        [[]],
      );

      await queue.pushAsync(chunks);

      await queue.drain();

      console.log(collection + ' uploaded');

      return { success: true };
    } catch (err) {
      console.error(err);
      throw new RpcException(
        `Error uploading collection ${collection} for file ${fileName}: ${err}`,
      );
    }
  }

  processRecords(records: any[]) {
    records.forEach((r, index, arr) => {
      const endIndex =
        index < records.length - 8 ? index + 7 : records.length - 1;
      const fiveAhead = arr[endIndex];

      // Add smoothed grades

      if (!fiveAhead) {
        console.log(endIndex);
      } else {
        if (
          r.altitude &&
          fiveAhead.altitude &&
          r.distance &&
          fiveAhead.distance
        ) {
          const percentGrade =
            ((r.altitude - fiveAhead.altitude) /
              (r.distance - fiveAhead.distance)) *
            (100 / (endIndex - index));
          if (percentGrade > -100 && percentGrade < 100) {
            for (let i = index; i <= endIndex; i++) {
              if (!records[i].percentGrade) {
                records[i].percentGrade = percentGrade;
              } else {
                records[i].percentGrade += percentGrade;
              }
            }
          }
        }
      }

      // scrubbing speed for sub-4 pace
      if (r.speed > 6.7056 || r.speed < 0) r.speed = records[index - 1].speed;

      if (index > 0)
        records[index - 1].effectivePace = this.getEffectivePace(
          records[index - 1].speed,
          records[index - 1].percentGrade,
        );
    });

    console.log('added grades');
  }

  getEffectivePace(pace: number, grade: number) {
    if (pace === null || pace === undefined) return null;
    if (grade === null || grade === undefined) return pace;
    const effectivePace =
      (155.4 * Math.pow(grade / 100, 5) -
        30.4 * Math.pow(grade / 100, 4) -
        43.3 * Math.pow(grade / 100, 3) +
        46.3 * Math.pow(grade / 100, 2) +
        19.5 * (grade / 100)) /
      4.5;

    return pace * (effectivePace + 1.06);
  }
}
