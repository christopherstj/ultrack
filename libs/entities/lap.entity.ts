import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { WorkoutModel } from "./workout.entity";

@Entity({
  name: "workouts_lap",
})
export class LapModel {
  @ManyToOne(() => WorkoutModel, (workout) => workout.laps)
  @JoinColumn({ name: "workoutId", referencedColumnName: "workoutId" })
  workout: WorkoutModel;

  @PrimaryColumn({ type: "int" })
  lapIndex: number;

  @PrimaryColumn({ type: "varchar" })
  workoutId: string;

  @Column({ type: "int" })
  avgRunningCadence: number;

  @Column({ type: "decimal", precision: 8, scale: 5 })
  avgSpeed: number;

  @Column({ type: "decimal", precision: 12, scale: 5 })
  avgStepLength: number;

  @Column({ type: "int" })
  maxCadence: number;

  @Column({ type: "int" })
  maxHeartRate: number;

  @Column({ type: "int" })
  maxRunningCadence: number;

  @Column({ type: "decimal", precision: 8, scale: 5 })
  maxSpeed: number;

  @Column({ type: "int" })
  minHeartRate: number;

  @Column({ type: "timestamp" })
  startTime: Date;

  @Column({ type: "int" })
  totalAscent: number;

  @Column({ type: "int" })
  totalCalories: number;

  @Column({ type: "int" })
  totalDescent: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  distance: number;

  @Column({ type: "decimal", precision: 18, scale: 2 })
  totalTime: number;

  @Column({ type: "decimal", precision: 18, scale: 2 })
  trackedTime: number;

  @Column({ type: "decimal", precision: 18, scale: 2 })
  movingTime: number;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  avgPercentGrade: number;

  @Column({ type: "decimal", precision: 8, scale: 5 })
  effectivePace: number;

  @Column({ type: "int" })
  effectiveLoad: number;

  @Column({ type: "decimal", precision: 4, scale: 2 })
  effectiveIntensity: number;

  @Column({ type: "int" })
  muscleDamage: number;
}
