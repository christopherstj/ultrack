import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'securityModel_localUser',
})
export class LocalUser {
  @PrimaryGeneratedColumn()
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
