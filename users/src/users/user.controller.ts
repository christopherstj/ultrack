import { Controller } from '@nestjs/common';
import { LocalUser } from './localUser.entity';
import { UserService } from './user.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

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

  @MessagePattern({ cmd: 'local/find-one' })
  async findLocalUserAsync(@Payload() data: any): Promise<LocalUser> {
    console.log(data);
    const result = await this.userService.findLocalUser(data.email);
    return result;
  }
}
