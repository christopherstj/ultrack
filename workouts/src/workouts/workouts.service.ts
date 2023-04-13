import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Workout } from './workout.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  getFirestore,
  DocumentReference,
  DocumentData,
} from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';
import { UserFitnessService } from 'src/user-fitness/user-fitness.service';
import { Record } from '@ultrack/libs';

@Injectable()
export class WorkoutsService {
  constructor(
    @InjectRepository(Workout) private workoutRepo: Repository<Workout>,
    private readonly configService: ConfigService,
    private readonly userFitnessService: UserFitnessService,
  ) {}

  async getWorkout(user: string, workoutId: string) {
    const result = await this.computeWorkout(user, workoutId);
    return result;
  }

  async computeWorkout(user: string, workoutId: string) {
    initializeApp({
      projectId: this.configService.get('PROJECT_ID'),
    });

    const db = getFirestore();

    const workoutRef = db.collection(user).doc(workoutId);

    const coordinates = await this.getCoordinatesByRef(workoutRef, [
      'positionLat',
      'positionLong',
    ]);

    const threshold = await this.userFitnessService.getUserThreshold(user);
  }

  async getCoordinatesById(
    user: string,
    workoutId: string,
    values: string[],
    resolution: number = 1,
    startTime?: Date,
    endTime?: Date,
  ) {
    initializeApp({
      projectId: this.configService.get('PROJECT_ID'),
    });

    const db = getFirestore();

    const workoutRef = db.collection(user).doc(workoutId);

    const result = await this.getCoordinatesByRef(
      workoutRef,
      values,
      resolution,
      startTime,
      endTime,
    );

    return result;
  }

  async getCoordinatesByRef(
    workoutRef: DocumentReference<DocumentData>,
    values: string[],
    resolution: number = 1,
    startTime?: Date,
    endTime?: Date,
  ) {
    var collectionRef = workoutRef.collection('records');

    var queryRef = null;

    if (startTime) queryRef = collectionRef.where('timestamp', '>=', startTime);
    if (startTime) queryRef = queryRef.where('timestamp', '<=', endTime);

    const result = queryRef
      ? await queryRef.select(...values).get()
      : await collectionRef.select(...values).get();

    return resolution === 1
      ? result
      : result.docs.reduce((prev, curr, index) => {
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
    initializeApp({
      projectId: this.configService.get('PROJECT_ID'),
    });

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
}
