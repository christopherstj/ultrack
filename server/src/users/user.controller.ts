import { Controller, Get } from '@nestjs/common';
import { LocalUser } from './localUser.entity';
import { UserService } from './user.service';

@Controller('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/local/all')
  async findAllAsync(): Promise<LocalUser[]> {
    const result = await this.userService.findAllLocalUsers();
    return result;
  }
}
