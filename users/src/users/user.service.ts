import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocalUserModel } from '@ultrack/libs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(LocalUserModel)
    private localUserRepo: Repository<LocalUserModel>,
  ) {}

  async findAllLocalUsers(): Promise<LocalUserModel[]> {
    return this.localUserRepo.find({
      where: {
        authSource: 'local',
      },
    });
  }

  async findLocalUser(email: string): Promise<LocalUserModel | null> {
    const user = await this.localUserRepo.findOne({
      where: {
        email,
        authSource: 'local',
      },
    });
    return user;
  }
}
