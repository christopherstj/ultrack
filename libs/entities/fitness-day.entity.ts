import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { LocalUserModel } from "./local-user.entity";

@Entity({
  name: "fitness_day",
})
export class FitnessDayModel {
  @ManyToOne(() => LocalUserModel, (user) => user.workouts)
  @JoinColumn({ name: "userId", referencedColumnName: "email" })
  user: LocalUserModel;

  @PrimaryColumn({ type: "varchar" })
  userId: string;

  @PrimaryColumn({ type: "date" })
  day: Date;

  @Column({ type: "int" })
  aerobicFitness: number;

  @Column({ type: "int" })
  aerobicFatigue: number;

  @Column({ type: "int" })
  durability: number;

  @Column({ type: "int" })
  damage: number;
}
