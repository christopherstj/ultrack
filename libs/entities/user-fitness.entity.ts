import { Column, Entity, OneToOne, PrimaryColumn } from "typeorm";
import { LocalUserModel } from "./local-user.entity";

@Entity({
  name: "details_userFitness",
})
export class UserFitnessModel {
  @PrimaryColumn()
  @OneToOne(() => LocalUserModel, (localUser) => localUser.email)
  userId: string;

  @Column({ type: "decimal", precision: 8, scale: 5 })
  thresholdPace?: number;

  @Column()
  thresholdPaceSource?: string;

  @Column()
  units: number;
}
