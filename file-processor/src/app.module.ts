import { Module } from '@nestjs/common';
import { FileProcessorModule } from './file-processor/file-processor.module';
import { initializeApp } from 'firebase-admin/app';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@ultrack/libs';

@Module({
  imports: [
    FileProcessorModule,
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor(private configService: ConfigService<EnvironmentVariables>) {}
}
