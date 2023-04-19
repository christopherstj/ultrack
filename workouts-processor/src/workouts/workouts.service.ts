import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  getFirestore,
  DocumentReference,
  DocumentData,
} from 'firebase-admin/firestore';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { SuccessMessage, Workout, Session } from '@ultrack/libs';

@Injectable()
export class WorkoutsService {
  constructor(
    @Inject('USERS_SERVICE') private usersClient: ClientProxy,
    @InjectRepository(Workout) private workoutRepo: Repository<Workout>,
    private readonly configService: ConfigService,
  ) {}

  async computeWorkout(
    user: string,
    workoutId: string,
  ): Promise<SuccessMessage> {
    try {
      const db = getFirestore();

      const workoutRef = db.collection(user).doc(workoutId);

      const res = this.usersClient.send<number>('get-threshold', {
        user,
      });

      const threshold = await lastValueFrom(res);

      if (!threshold) throw new RpcException('No threshold pace found');

      const session = await this.getSessionByRef(workoutRef);

      const effectivePaces = await this.getRecordsByRef(workoutRef, [
        'effectivePace',
      ]);

      const speeds = await this.getRecordsByRef(workoutRef, ['speed']);

      const movingTime = speeds.filter((s) => s.speed !== 0).length;

      const avgEffectivePace = this.getEffectivePace(
        effectivePaces.map((p) => p.effectivePace),
      );

      const effectiveLoad = this.getEffectiveLoad(
        effectivePaces.map((p) => p.effectivePace),
        threshold,
      );

      const workout = new Workout();

      console.log(session);

      workout.workoutId = workoutId;
      workout.userId = user;
      workout.distance = session.totalDistance;
      workout.totalTime = session.totalElapsedTime;
      workout.trackedTime = session.totalTimerTime;
      workout.movingTime = movingTime;
      workout.avgCadence = session.avgCadence;
      workout.avgHeartRate = session.avgHeartRate;
      workout.avgSpeed = session.avgSpeed;
      workout.avgStepLength = session.avgStepLength;
      workout.maxCadence = session.maxCadence;
      workout.maxSpeed = session.maxSpeed;
      workout.maxHeartRate = session.maxHeartRate;
      workout.minHeartRate = session.minHeartRate;
      workout.startTime = session.startTime;
      workout.runType = session.subSport || '';
      workout.totalAscent = session.totalAscent;
      workout.totalDescent = session.totalDescent;
      workout.totalCalories = session.totalCalories;
      workout.thresholdPace = threshold;
      workout.effectivePace = avgEffectivePace;
      workout.trainingStress =
        (session.totalTimerTime *
          avgEffectivePace *
          (avgEffectivePace / threshold)) /
        (threshold * 36);
      workout.effectiveIntensity = avgEffectivePace / threshold;

      console.log(workout);

      const result = await this.workoutRepo.save(workout);

      return { success: true };
    } catch (err) {
      console.error(err);
      throw new RpcException(err);
    }
  }

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
    startTime?: Date,
    endTime?: Date,
  ) {
    var collectionRef = workoutRef.collection('records');

    var queryRef = null;

    if (startTime) queryRef = collectionRef.where('timestamp', '>=', startTime);
    if (endTime) queryRef = queryRef.where('timestamp', '<=', endTime);

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
  }

  async getLapsByWorkout(user: string, workoutId: string) {
    const db = getFirestore();

    const workoutRef = db.collection(user).doc(workoutId);

    const result = await this.getLapsByRef(workoutRef);

    return result;
  }

  async getLapsByRef(workoutRef: DocumentReference<DocumentData>) {
    const laps = await workoutRef.collection('laps').get();

    const lapDocs = laps.docs;

    return lapDocs;
  }

  async getSessionByRef(
    workoutRef: DocumentReference<DocumentData>,
  ): Promise<any> {
    const sessions = await workoutRef.collection('sessions').get();

    const session = sessions.docs.map((d) => ({
      ...d.data(),
      startTime: d.data().startTime.toDate(),
    }))[0];

    return session as Session;
  }

  getEffectivePace(paces: number[]) {
    return (
      paces.reduce(
        (prev, curr) =>
          curr !== null && curr !== undefined ? prev + curr : prev,
        0,
      ) / paces.length
    );
  }

  getEffectiveLoad(time: number, avgEffectivePace: number, threshold: number) {
    return (time *
      avgEffectivePace *
      (avgEffectivePace / threshold)) /
    (threshold * 36);
  }
}
