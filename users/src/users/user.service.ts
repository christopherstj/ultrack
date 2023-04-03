import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocalUser } from './localUser.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(LocalUser) private localUserRepo: Repository<LocalUser>,
  ) {}

  async findAllLocalUsers(): Promise<LocalUser[]> {
    return this.localUserRepo.find();
  }

  async findLocalUser(email: string): Promise<LocalUser | null> {
    const user = await this.localUserRepo.findOne({
      where: {
        email,
      },
    });
    return user;
  }
}
