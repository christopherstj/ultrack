import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocalUser } from '@ultrack/libs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(LocalUser) private localUserRepo: Repository<LocalUser>,
  ) {}

  async findAllLocalUsers(): Promise<LocalUser[]> {
    return this.localUserRepo.find({
      where: {
        source: 'local',
      },
    });
  }

  async findLocalUser(email: string): Promise<LocalUser | null> {
    const user = await this.localUserRepo.findOne({
      where: {
        email,
        source: 'local',
      },
    });
    return user;
  }
}
