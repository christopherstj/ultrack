import { Module } from '@nestjs/common';
import { UserModule } from './users/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  EnvironmentVariables,
  FitnessDayModel,
  LapModel,
  LocalUserModel,
  UserFitnessModel,
  WorkoutModel,
} from '@ultrack/libs';
import { UserFitnessModule } from './user-fitness/user-fitness.module';
// test

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot(
      process.env.NODE_ENV === 'production'
        ? {
            load: [
              () => ({
                MYSQL_HOST: process.env.MYSQL_HOST,
                MYSQL_USER_NAME: process.env.MYSQL_USER_NAME,
                MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
                MYSQL_DB: process.env.MYSQL_DB,
                JWT_SECRET: process.env.JWT_SECRET,
              }),
            ],
          }
        : {
            envFilePath: ['.env.development.local', '.env.development', '.env'],
          },
    ),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        type: 'mysql',
        host: configService.get('MYSQL_HOST'),
        port: 3306,
        username: configService.get('MYSQL_USER_NAME'),
        password: configService.get('MYSQL_USER_PASSWORD'),
        database: configService.get('MYSQL_DB'),
        entities: [
          LocalUserModel,
          UserFitnessModel,
          WorkoutModel,
          LapModel,
          FitnessDayModel,
        ],
        synchronize: process.env.NODE_ENV === 'development',
      }),
      inject: [ConfigService],
    }),
    UserFitnessModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
