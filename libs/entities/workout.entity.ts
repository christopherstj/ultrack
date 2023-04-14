import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    name: "workouts_workout",
})
export class Workout {
    @PrimaryColumn()
    workoutId: string;

    @Column()
    userId: string;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    distance: number;

    @Column({ type: "decimal", precision: 18, scale: 2 })
    totalTime: number;

    @Column({ type: "decimal", precision: 18, scale: 2 })
    trackedTime: number;

    @Column({ type: "decimal", precision: 18, scale: 2 })
    movingTime: number;

    @Column()
    avgCadence: number;

    @Column()
    avgHeartRate: number;

    @Column({ type: "decimal", precision: 8, scale: 5 })
    avgSpeed: number;

    @Column({ type: "decimal", precision: 12, scale: 5 })
    avgStepLength: number;

    @Column()
    maxCadence: number;

    @Column({ type: "decimal", precision: 8, scale: 5 })
    maxSpeed: number;

    @Column()
    maxHeartRate: number;

    @Column()
    minHeartRate: number;

    @Column({ type: "datetime" })
    startTime: Date;

    @Column()
    runType: string;

    @Column()
    totalAscent: number;

    @Column()
    totalDescent: number;

    @Column()
    totalCalories: number;

    @Column({ type: "decimal", precision: 8, scale: 5 })
    thresholdPace: number;

    @Column({ type: "decimal", precision: 8, scale: 5 })
    effectivePace: number;

    @Column()
    trainingStress: number;

    @Column({ type: "decimal", precision: 4, scale: 2 })
    effectiveIntensity: number;
}
