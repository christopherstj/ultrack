import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalUser } from './localUser.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([LocalUser])],
  exports: [],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
