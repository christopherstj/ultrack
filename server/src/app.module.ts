import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvironmentVariables } from './types/common';
import { LocalUser } from './users/localUser.entity';
import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
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
        entities: [LocalUser],
        synchronize: process.env.NODE_ENV === 'development',
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
