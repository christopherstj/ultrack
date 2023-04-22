import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
  SuccessMessage,
  WorkoutModel,
  Session,
  Lap,
  LapModel,
} from '@ultrack/libs';

@Injectable()
export class WorkoutsService {
  constructor(
    @Inject('USERS_SERVICE') private usersClient: ClientProxy,
    @Inject('WORKOUTS_RETRIEVER_SERVICE')
    private workoutsRetrieverClient: ClientProxy,
    @InjectRepository(WorkoutModel)
    private workoutRepo: Repository<WorkoutModel>,
    @InjectRepository(LapModel)
    private lapRepo: Repository<LapModel>,
  ) {}

  async computeWorkout(
    user: string,
    workoutId: string,
  ): Promise<SuccessMessage> {
    try {
      const res = this.usersClient.send<number>('get-threshold', {
        user,
      });

      const threshold = await lastValueFrom(res);

      if (!threshold) throw new RpcException('No threshold pace found');

      const sessionRes = this.workoutsRetrieverClient.send<Session>(
        'get-session-firestore-data',
        {
          user,
          workoutId,
        },
      );

      const session = await lastValueFrom(sessionRes);

      const recordsRes = this.workoutsRetrieverClient.send<
        { effectivePace?: number; speed?: number; percentGrade?: number }[]
      >('get-records', {
        user,
        workoutId,
        values: ['effectivePace', 'speed', 'percentGrade'],
      });

      const records = await lastValueFrom(recordsRes);

      const movingTime = records.filter((r) => r.speed !== 0).length;

      const avgEffectivePace = this.getEffectivePace(
        records.map((r) => r.effectivePace),
      );

      const effectiveLoad = this.getEffectiveLoad(
        session.totalTimerTime,
        avgEffectivePace,
        threshold,
      );

      const avgGrade = this.getAvgGrade(records.map((r) => r.percentGrade));

      const workout = new WorkoutModel();

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
      workout.avgPercentGrade = avgGrade;
      workout.effectivePace = avgEffectivePace;
      workout.effectiveLoad = effectiveLoad;
      workout.effectiveIntensity = avgEffectivePace / threshold;

      const result = await this.workoutRepo.save(workout);

      console.log(`workout ${workoutId} added to SQL`);

      this.processLaps(user, workoutId, threshold);

      return { success: true };
    } catch (err) {
      console.error(err);
      throw new RpcException(err);
    }
  }

  async processLaps(user: string, workoutId: string, threshold: number) {
    const lapsRes = await this.workoutsRetrieverClient.send<Lap[]>(
      'get-lap-firestore-data',
      { user, workoutId },
    );

    const laps = await lastValueFrom(lapsRes);

    const processedLaps = await Promise.all(
      laps
        .map((l) => ({ ...l, startTime: new Date(l.startTime) }))
        .map(
          async (l, index) =>
            await this.processLap(l, index, user, workoutId, threshold),
        ),
    );

    const result = await this.lapRepo.save(processedLaps);

    console.log(`laps for ${workoutId} added to SQL`);
  }

  async processLap(
    lap: Lap,
    index: number,
    user: string,
    workoutId: string,
    threshold: number,
  ): Promise<LapModel> {
    const recordsRes = this.workoutsRetrieverClient.send<
      {
        speed?: number;
        effectivePace?: number;
        percentGrade?: number;
        timestamp: Date;
      }[]
    >('get-records', {
      user,
      workoutId,
      values: ['speed', 'effectivePace', 'percentGrade', 'timestamp'],
      startTime: lap.startTime,
      endTime: new Date(lap.startTime.getTime() + lap.totalElapsedTime * 1000),
    });

    const records = await lastValueFrom(recordsRes);

    const movingTime = records.filter((r) => r.speed !== 0).length;

    const avgEffectivePace = this.getEffectivePace(
      records.map((r) => r.effectivePace),
    );

    const effectiveLoad = this.getEffectiveLoad(
      lap.totalTimerTime,
      avgEffectivePace,
      threshold,
    );

    const avgGrade = this.getAvgGrade(records.map((r) => r.percentGrade));

    const lapModel = new LapModel();

    lapModel.avgPercentGrade = avgGrade;
    lapModel.avgRunningCadence = lap.avgRunningCadence;
    lapModel.avgSpeed = lap.avgSpeed;
    lapModel.avgStepLength = lap.avgStepLength;
    lapModel.distance = lap.totalDistance;
    lapModel.effectiveIntensity = avgEffectivePace / threshold;
    lapModel.effectiveLoad = effectiveLoad;
    lapModel.effectivePace = avgEffectivePace;
    lapModel.lapIndex = index;
    lapModel.maxCadence = lap.maxCadence;
    lapModel.maxHeartRate = lap.maxHeartRate;
    lapModel.maxRunningCadence = lap.maxRunningCadence;
    lapModel.maxSpeed = lap.maxSpeed;
    lapModel.minHeartRate = lap.minHeartRate;
    lapModel.movingTime = movingTime;
    lapModel.startTime = lap.startTime;
    lapModel.totalAscent = lap.totalAscent;
    lapModel.totalDescent = lap.totalDescent;
    lapModel.totalCalories = lap.totalCalories;
    lapModel.totalTime = lap.totalElapsedTime;
    lapModel.trackedTime = lap.totalTimerTime;
    lapModel.workoutId = workoutId;

    return lapModel;
  }

  getAvgGrade(grades: (number | null | undefined)[]) {
    return (
      grades.reduce(
        (prev, curr) =>
          curr !== null && curr !== undefined ? prev + Math.abs(curr) : prev,
        0,
      ) / grades.length
    );
  }

  getEffectivePace(paces: (number | null | undefined)[]) {
    return (
      paces.reduce(
        (prev, curr) =>
          curr !== null && curr !== undefined ? prev + curr : prev,
        0,
      ) / paces.length
    );
  }

  getEffectiveLoad(time: number, avgEffectivePace: number, threshold: number) {
    return (
      (time * avgEffectivePace * (avgEffectivePace / threshold)) /
      (threshold * 36)
    );
  }
}
