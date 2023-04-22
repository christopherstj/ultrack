import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({
  name: "securityModel_localUser",
})
export class LocalUser {
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
}
