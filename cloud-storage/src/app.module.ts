import { Module } from '@nestjs/common';
import { CloudStorageModule } from './cloud-storage/cloud-storage.module';
import { ConfigModule } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    CloudStorageModule,
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
export class AppModule {}
