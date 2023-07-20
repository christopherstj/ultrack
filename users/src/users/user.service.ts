import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocalUserModel, SuccessMessage } from '@ultrack/libs';
import * as bcrypt from 'bcryptjs';
import { validateNewUser } from './utils';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(LocalUserModel)
    private localUserRepo: Repository<LocalUserModel>,
  ) {}

  async createUser(
    email: string,
    password: string,
    confirmPassword: string,
  ): Promise<SuccessMessage> {
    const userExists = await this.findLocalUser(email);

    if (userExists) {
      return {
        success: false,
        msg: 'User already exists',
      };
    }

    const errors = validateNewUser(email, password, confirmPassword);

    if (errors.length > 0) {
      return {
        success: false,
        msg: 'Invalid input',
        errorList: errors,
      };
    }

    const user = new LocalUserModel();

    const hashedPassword = await bcrypt.hash(password, 10);

    user.email = email;
    user.hashedPassword = hashedPassword;

    try {
      await this.localUserRepo.save(user);
      return {
        success: true,
        msg: 'User created successfully',
      };
    } catch (err) {
      throw new RpcException(err);
    }
  }
  async updateUser(
    email: string,
    password?: string,
    confirmPassword?: string,
    firstName?: string,
    lastName?: string,
  ): Promise<SuccessMessage> {
    const user = await this.findLocalUser(email);

    if (!user) {
      return {
        success: false,
        msg: 'User does not exist',
      };
    }

    if (password && confirmPassword) {
      const errors = validateNewUser(email, password, confirmPassword);
      if (errors.length > 0) {
        return {
          success: false,
          msg: 'Invalid input',
          errorList: errors,
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      user.email = email;
      user.hashedPassword = hashedPassword;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    try {
      await this.localUserRepo.update({ email }, user);
      return {
        success: true,
        msg: 'User updated successfully',
      };
    } catch (err) {
      throw new RpcException(err);
    }
  }

  async findAllLocalUsers(): Promise<LocalUserModel[]> {
    try {
      return this.localUserRepo.find({
        where: {
          authSource: 'local',
        },
      });
    } catch (err) {
      throw new RpcException(err);
    }
  }

  async findLocalUser(email: string): Promise<LocalUserModel | null> {
    try {
      const user = await this.localUserRepo.findOne({
        where: {
          email,
          authSource: 'local',
        },
      });
      return user;
    } catch (err) {
      throw new RpcException(err);
    }
  }
}
