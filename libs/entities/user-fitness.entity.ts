import { Column, Entity, OneToOne, PrimaryColumn } from "typeorm";
import { LocalUserModel } from "./local-user.entity";

@Entity({
  name: "details_userFitness",
})
export class UserFitnessModel {
  @OneToOne(() => LocalUserModel, (user) => user.details)
  user: LocalUserModel;

  @PrimaryColumn()
  userId: string;

  @Column({ type: "decimal", precision: 8, scale: 5 })
  thresholdPace?: number;

  @Column()
  thresholdPaceSource?: string;

  @Column()
  units: string;
}
