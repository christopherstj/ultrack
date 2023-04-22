import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Session } from '@ultrack/libs';
import {
  getFirestore,
  DocumentReference,
  DocumentData,
  Timestamp,
} from 'firebase-admin/firestore';

@Injectable()
export class WorkoutsRetrieverService {
  constructor() {}

  async getRecordsById(
    user: string,
    workoutId: string,
    values: string[],
    resolution: number = 1,
    startTime?: Date,
    endTime?: Date,
  ) {
    const db = getFirestore();

    const workoutRef = db.collection(user).doc(workoutId);

    const result = await this.getRecordsByRef(
      workoutRef,
      values,
      resolution,
      startTime,
      endTime,
    );

    return result;
  }

  async getRecordsByRef(
    workoutRef: DocumentReference<DocumentData>,
    values: string[],
    resolution: number = 1,
    startTime?: Date | string,
    endTime?: Date | string,
  ) {
    try {
      var collectionRef = workoutRef.collection('records');

      var queryRef = null;

      if (startTime && endTime) {
        queryRef = collectionRef
          .where('timestamp', '>=', Timestamp.fromDate(new Date(startTime)))
          .where('timestamp', '<', Timestamp.fromDate(new Date(endTime)));
      }

      const result = queryRef
        ? await queryRef.select(...values).get()
        : await collectionRef.select(...values).get();

      return resolution === 1
        ? result.docs.map((d) => d.data())
        : result.docs
            .map((d) => d.data())
            .reduce((prev, curr, index) => {
              if (index % resolution === 0) {
                prev.push({
                  ...curr.data(),
                  percentGrade:
                    ((curr.data().altitude - prev.slice(-1)[0].altitude) /
                      (curr.data().distance - prev.slice(-1)[0].distance)) *
                    100,
                });
                return prev;
              } else {
                return prev;
              }
            }, []);
    } catch (err) {
      console.error(err);
      throw new RpcException('Getting records failed: ' + err);
    }
  }

  async getLapsFromFirestoreById(user: string, workoutId: string) {
    const db = getFirestore();

    const workoutRef = db.collection(user).doc(workoutId);

    const result = await this.getLapsFromFirestoreByRef(workoutRef);

    return result;
  }

  async getLapsFromFirestoreByRef(workoutRef: DocumentReference<DocumentData>) {
    const laps = await workoutRef.collection('laps').get();

    const lapDocs = laps.docs.map((l) => ({
      ...l.data(),
      startTime: l.data().startTime.toDate(),
    }));

    return lapDocs;
  }

  async getSessionById(user: string, workoutId: string): Promise<Session> {
    const db = getFirestore();

    const workoutRef = db.collection(user).doc(workoutId);

    const result = await this.getSessionByRef(workoutRef);

    return result;
  }

  async getSessionByRef(
    workoutRef: DocumentReference<DocumentData>,
  ): Promise<Session> {
    const sessions = await workoutRef.collection('sessions').get();

    const session = sessions.docs.map((d) => ({
      ...d.data(),
      startTime: d.data().startTime.toDate(),
    }))[0];

    return session as Session;
  }
}
