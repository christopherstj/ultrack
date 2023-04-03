import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { UsersController } from './users/users.controller';
import { CloudStorageController } from './cloud-storage/cloud-storage.controller';
import { JwtModule } from '@nestjs/jwt';
import { EnvironmentVariables } from '@ultrack/libs';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local', '.env.development', '.env'],
    }),
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController, CloudStorageController],
  providers: [
    Logger,
    {
      provide: 'USERS_SERVICE',
      useFactory: () => {
        return ClientProxyFactory.create({
          options: {
            port: 3001,
          },
          transport: Transport.TCP,
        });
      },
      inject: [],
    },
    {
      provide: 'CLOUD_STORAGE_SERVICE',
      useFactory: () => {
        return ClientProxyFactory.create({
          options: {
            port: 3002,
          },
          transport: Transport.TCP,
        });
      },
      inject: [],
    },
  ],
})
export class AppModule {}
