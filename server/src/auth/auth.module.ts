import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@ultrack/libs';
import { AuthGuard } from './auth.guard';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  providers: [
    AuthService,
    AuthGuard,
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
  ],
  exports: [AuthGuard, AuthService],
  controllers: [AuthController],
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AuthModule {}
