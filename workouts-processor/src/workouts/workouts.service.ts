import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
  SuccessMessage,
  WorkoutModel,
  Session,
  Lap,
  LapModel,
  FitnessDayModel,
  formatDateForQuery,
} from '@ultrack/libs';

const MILLS_PER_DAY = 60 * 60 * 24 * 1000;

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
    @InjectRepository(FitnessDayModel)
    private fitnessDayRepo: Repository<FitnessDayModel>,
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

      const muscleDamage = this.getMuscleDamageByRecords(
        records.map((r) => ({ speed: r.speed, percentGrade: r.percentGrade })),
      );

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
      workout.muscleDamage = muscleDamage;

      const result = await this.workoutRepo.save(workout);

      console.log(`workout ${workoutId} added to SQL`);

      await this.processLaps(user, workoutId, threshold);

      await this.updateFitnessDays(
        user,
        new Date(new Date(session.startTime).toDateString()),
      );

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

    const muscleDamage = this.getMuscleDamageByRecords(
      records.map((r) => ({ speed: r.speed, percentGrade: r.percentGrade })),
    );

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
    lapModel.muscleDamage = muscleDamage;

    return lapModel;
  }

  async updateFitnessDays(user: string, day: Date) {
    try {
      const daysToUpdate: {
        day: Date;
        effectiveLoad: boolean;
        muscleDamage: boolean;
      }[] = [];
      for (var i = 0; i < 90; i++) {
        const newDay: {
          day: Date;
          effectiveLoad: boolean;
          muscleDamage: boolean;
        } = {
          day: new Date(day.getTime() + MILLS_PER_DAY * i),
          effectiveLoad: i < 60,
          muscleDamage: true,
        };
        daysToUpdate.push(newDay);
      }

      const result = await Promise.all(
        daysToUpdate.map(async (dayToUpdate) => {
          try {
            const fitnessDay = new FitnessDayModel();

            fitnessDay.userId = user;
            fitnessDay.day = dayToUpdate.day;

            const muscleDamage = await this.getMuscleDamageByDate(
              user,
              dayToUpdate.day,
            );
            const muscleDurability = await this.getMuscleDurability(
              user,
              dayToUpdate.day,
            );

            fitnessDay.damage = muscleDamage;
            fitnessDay.durability = muscleDurability;

            if (dayToUpdate.effectiveLoad) {
              const aerobicFitness = await this.getAerobicFitness(
                user,
                dayToUpdate.day,
              );
              const aerobicFatigue = await this.getAerobicFatigue(
                user,
                dayToUpdate.day,
              );

              fitnessDay.aerobicFitness = aerobicFitness;
              fitnessDay.aerobicFatigue = aerobicFatigue;
            }

            await this.saveFitnessDay(fitnessDay);

            return true;
          } catch (err) {
            console.error(err);
            return false;
          }
        }),
      );

      if (result.every((value) => value)) return true;
    } catch (err) {
      console.error(err);
      throw new RpcException('Saving fitness days failed: ' + err);
    }
  }

  async saveFitnessDay(fitnessDay: FitnessDayModel) {
    const existingFitnessDay = await this.fitnessDayRepo.findOne({
      where: { userId: fitnessDay.userId, day: fitnessDay.day },
    });
    console.log(fitnessDay);
    if (existingFitnessDay) {
      existingFitnessDay.damage = fitnessDay.damage;
      existingFitnessDay.durability = fitnessDay.durability;

      if (fitnessDay.aerobicFatigue && fitnessDay.aerobicFitness) {
        existingFitnessDay.aerobicFatigue = fitnessDay.aerobicFatigue;
        existingFitnessDay.aerobicFitness = fitnessDay.aerobicFitness;
        await this.fitnessDayRepo.save(existingFitnessDay);
      }
    } else {
      await this.fitnessDayRepo.save(fitnessDay);
    }
  }

  async getAerobicFitness(user: string, day: Date) {
    const startDate = new Date(day.getTime() - MILLS_PER_DAY * 60);
    console.log(
      `SELECT SUM(effectiveLoad) / DATEDIFF('${formatDateForQuery(
        day,
      )}', '${formatDateForQuery(
        startDate,
      )}') AS aerobicFitness FROM workouts_workout WHERE userId = '${user}' AND startTime BETWEEN '${formatDateForQuery(
        startDate,
      )}' AND '${formatDateForQuery(day)}';`,
    );
    const result = await this.workoutRepo.query(
      'SELECT SUM(effectiveLoad) / DATEDIFF(?, ?) AS aerobicFitness FROM workouts_workout WHERE userId = ? AND startTime BETWEEN ? AND ?;',
      [
        formatDateForQuery(day),
        formatDateForQuery(startDate),
        user,
        formatDateForQuery(startDate),
        formatDateForQuery(day),
      ],
    );

    return result[0].aerobicFitness;
  }

  async getAerobicFatigue(user: string, day: Date) {
    const startDate = new Date(day.getTime() - MILLS_PER_DAY * 7);
    const result = await this.workoutRepo.query(
      'SELECT SUM(effectiveLoad) / DATEDIFF(?, ?) AS aerobicFatigue FROM workouts_workout WHERE userId = ? AND startTime BETWEEN ? AND ?;',
      [
        formatDateForQuery(day),
        formatDateForQuery(startDate),
        user,
        formatDateForQuery(startDate),
        formatDateForQuery(day),
      ],
    );

    return result[0].aerobicFatigue;
  }

  async getMuscleDurability(user: string, day: Date) {
    const startDate = new Date(day.getTime() - MILLS_PER_DAY * 90);
    const result = await this.workoutRepo.query(
      'SELECT SUM(muscleDamage) / DATEDIFF(?, ?) AS muscleDurability FROM workouts_workout WHERE userId = ? AND startTime BETWEEN ? AND ?;',
      [
        formatDateForQuery(day),
        formatDateForQuery(startDate),
        user,
        formatDateForQuery(startDate),
        formatDateForQuery(day),
      ],
    );

    return result[0].muscleDurability;
  }

  async getMuscleDamageByDate(user: string, day: Date) {
    const startDate = new Date(day.getTime() - MILLS_PER_DAY * 7);
    const result = await this.workoutRepo.query(
      'SELECT SUM(muscleDamage) / DATEDIFF(?, ?) AS muscleDamage FROM workouts_workout WHERE userId = ? AND startTime BETWEEN ? AND ?;',
      [
        formatDateForQuery(day),
        formatDateForQuery(startDate),
        user,
        formatDateForQuery(startDate),
        formatDateForQuery(day),
      ],
    );

    return result[0].muscleDamage;
  }

  getMuscleDamageByRecords(
    data: {
      percentGrade: number | null | undefined;
      speed: number | null | undefined;
    }[],
  ) {
    const damage = data.reduce((prev, curr) => {
      if (
        curr.percentGrade !== null &&
        curr.percentGrade !== undefined &&
        curr.speed !== null &&
        curr.speed !== undefined &&
        curr.percentGrade < 0
      ) {
        return prev + (curr.percentGrade / 100) * curr.speed;
      } else {
        return prev;
      }
    }, 0);
    return Math.abs(damage / 10);
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
