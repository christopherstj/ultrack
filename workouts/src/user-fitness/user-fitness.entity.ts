import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'details_userFitness',
})
export class UserFitness {
  @PrimaryGeneratedColumn()
  userId: string;

  @Column({ type: 'decimal', precision: 8, scale: 5 })
  thresholdPace?: number;

  @Column()
  units: number;
}
