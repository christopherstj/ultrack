import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'workouts_workout',
})
export class Workout {
  @PrimaryGeneratedColumn()
  workoutId: string;

  @Column()
  userId: string;

  @Column()
  distance: number;

  @Column()
  totalTime: number;

  @Column()
  trackedTime: number;

  @Column()
  movingTime: number;

  @Column()
  avgCadence: number;

  @Column()
  avgHeartRate: number;

  @Column()
  avgSpeed: number;

  @Column()
  avgStepLength: number;

  @Column()
  maxCadence: number;

  @Column()
  maxSpeed: number;

  @Column()
  maxHeartRate: number;

  @Column()
  minHeartRate: number;

  @Column()
  startTime: Date;

  @Column()
  runType: string;

  @Column()
  totalAscent: number;

  @Column()
  totalDescent: number;

  @Column()
  totalCalories: number;

  @Column()
  thresholdPace: number;
}
