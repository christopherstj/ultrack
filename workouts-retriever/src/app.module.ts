import { Module } from '@nestjs/common';
import { WorkoutsRetrieverModule } from './workouts-retriever/workouts-retriever.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    WorkoutsRetrieverModule,
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local', '.env.development', '.env'],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
