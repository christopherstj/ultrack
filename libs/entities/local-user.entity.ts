import { Column, Entity, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { UserFitnessModel } from "./user-fitness.entity";
import { WorkoutModel } from "./workout.entity";
import { FitnessDayModel } from "./fitness-day.entity";

@Entity({
  name: "securityModel_localUser",
})
export class LocalUserModel {
  @PrimaryColumn()
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName?: string;

  @Column()
  hashedPassword?: string;

  @Column()
  source?: string;

  @OneToOne(() => UserFitnessModel, (user) => user.user)
  details: UserFitnessModel;

  @OneToMany(() => WorkoutModel, (workout) => workout.user)
  workouts: WorkoutModel[];

  @OneToMany(() => FitnessDayModel, (day) => day.user)
  fitnessDays: FitnessDayModel[];
}
