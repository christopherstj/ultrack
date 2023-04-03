import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { LocalUser } from './localUser.entity';
import { UserService } from './user.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PubSubInterceptor } from 'nestjs-pubsub-transport';

@UseInterceptors(PubSubInterceptor)
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('echo')
  echo(@Payload() data: object) {
    console.log('Woohoo that worked!');
    return data;
  }

  @MessagePattern('/local/all')
  async findAllAsync(): Promise<LocalUser[]> {
    const result = await this.userService.findAllLocalUsers();
    return result;
  }
}
