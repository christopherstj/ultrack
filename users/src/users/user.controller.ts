import { Controller } from '@nestjs/common';
import { LocalUserModel } from '@ultrack/libs';
import { UserService } from './user.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('local/all')
  async findAllAsync(): Promise<LocalUserModel[]> {
    const result = await this.userService.findAllLocalUsers();
    return result;
  }

  @MessagePattern('local/find-one')
  async findLocalUserAsync(@Payload() data: any): Promise<LocalUserModel> {
    console.log(data);
    const result = await this.userService.findLocalUser(data.email);
    return result;
  }
}
