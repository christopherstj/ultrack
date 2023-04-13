import { Module } from '@nestjs/common';
import { WorkoutsModule } from './workouts/workouts.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvironmentVariables } from '@ultrack/libs';
import { Workout } from './workouts/workout.entity';
import { UserFitness } from './user-fitness/user-fitness.entity';
import { UserFitnessModule } from './user-fitness/user-fitness.module';
import { WorkoutProcessorModule } from './workout-processor/workout-processor.module';

@Module({
  imports: [
    WorkoutsModule,
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local', '.env.development', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        type: 'mysql',
        host: configService.get('MYSQL_HOST'),
        port: 3306,
        username: configService.get('MYSQL_USER_NAME'),
        password: configService.get('MYSQL_USER_PASSWORD'),
        database: configService.get('MYSQL_DB'),
        entities: [Workout, UserFitness],
        synchronize: process.env.NODE_ENV === 'development',
      }),
      inject: [ConfigService],
    }),
    UserFitnessModule,
    WorkoutProcessorModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
