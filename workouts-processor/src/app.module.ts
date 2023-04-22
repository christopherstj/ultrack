import { Module } from '@nestjs/common';
import { WorkoutsModule } from './workouts/workouts.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  EnvironmentVariables,
  LapModel,
  LocalUserModel,
  UserFitnessModel,
  WorkoutModel,
} from '@ultrack/libs';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

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
        entities: [LocalUserModel, UserFitnessModel, WorkoutModel, LapModel],
        synchronize: process.env.NODE_ENV === 'development',
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
