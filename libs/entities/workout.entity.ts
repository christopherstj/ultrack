import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { LocalUserModel } from "./local-user.entity";

@Entity({
  name: "workouts_workout",
})
export class WorkoutModel {
  @PrimaryColumn({ type: "varchar" })
  workoutId: string;

  @PrimaryColumn({ type: "varchar" })
  @ManyToOne(() => LocalUserModel, (user) => user.email, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  userId: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  distance: number;

  @Column({ type: "decimal", precision: 18, scale: 2 })
  totalTime: number;

  @Column({ type: "decimal", precision: 18, scale: 2 })
  trackedTime: number;

  @Column({ type: "decimal", precision: 18, scale: 2 })
  movingTime: number;

  @Column({ type: "int" })
  avgCadence: number;

  @Column({ type: "int" })
  avgHeartRate: number;

  @Column({ type: "decimal", precision: 8, scale: 5 })
  avgSpeed: number;

  @Column({ type: "decimal", precision: 12, scale: 5 })
  avgStepLength: number;

  @Column({ type: "int" })
  maxCadence: number;

  @Column({ type: "decimal", precision: 8, scale: 5 })
  maxSpeed: number;

  @Column({ type: "int" })
  maxHeartRate: number;

  @Column({ type: "int" })
  minHeartRate: number;

  @Column({ type: "timestamp" })
  startTime: Date;

  @Column({ type: "varchar" })
  runType: string;

  @Column({ type: "int" })
  totalAscent: number;

  @Column({ type: "int" })
  totalDescent: number;

  @Column({ type: "int" })
  totalCalories: number;

  @Column({ type: "decimal", precision: 8, scale: 5 })
  thresholdPace: number;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  avgPercentGrade: number;

  @Column({ type: "decimal", precision: 8, scale: 5 })
  effectivePace: number;

  @Column({ type: "int" })
  effectiveLoad: number;

  @Column({ type: "decimal", precision: 4, scale: 2 })
  effectiveIntensity: number;
}
