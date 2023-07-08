import { Controller } from '@nestjs/common';
import { LocalUserModel, SuccessMessage } from '@ultrack/libs';
import { UserService } from './user.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('local/create-user')
  async createUserAsync(
    @Payload()
    data: {
      email: string;
      password: string;
      confirmPassword: string;
      firstName: string;
      lastName: string;
    },
  ): Promise<SuccessMessage> {
    const result = await this.userService.createUser(
      data.email,
      data.password,
      data.confirmPassword,
      data.firstName,
      data.lastName,
    );
    return result;
  }

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
