import { Module } from '@nestjs/common';
import { CloudStorageModule } from './cloud-storage/cloud-storage.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    CloudStorageModule,
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local', '.env.development', '.env'],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}