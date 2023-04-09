import { Module } from '@nestjs/common';
import { FileProcessorModule } from './file-processor/file-processor.module';
import { initializeApp } from 'firebase-admin/app';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@ultrack/libs';

@Module({
  imports: [
    FileProcessorModule,
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local', '.env.development', '.env'],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor(private configService: ConfigService<EnvironmentVariables>) {}
}
