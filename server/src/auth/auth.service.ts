import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { SuccessMessage } from '@ultrack/libs';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersServiceClient: ClientProxy,
    private jwtService: JwtService,
  ) {}

  async createUser(
    email: string,
    password: string,
    confirmPassword: string,
  ): Promise<any> {
    const successMessage: SuccessMessage = await firstValueFrom(
      this.usersServiceClient.send('local/create-user', {
        email,
        password,
        confirmPassword,
      }),
    );
    return successMessage;
  }

  async signIn(email: string, pass: string): Promise<any> {
    if (!email || !pass) throw new UnauthorizedException();

    const user = await firstValueFrom(
      this.usersServiceClient.send('local/find-one', { email }),
    );

    if (!user) throw new UnauthorizedException();

    const success = await bcrypt.compare(pass, user.hashedPassword);

    if (!success) throw new UnauthorizedException();

    const payload = { email: user.email };

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async getLoggedInUser(email: string): Promise<any> {
    const user = await firstValueFrom(
      this.usersServiceClient.send('local/find-one', { email }),
    );
    const threshold = await firstValueFrom(
      this.usersServiceClient.send('get-threshold', {
        user: email,
      }),
    );
    const units = await firstValueFrom(
      this.usersServiceClient.send('get-units', { user: email }),
    );
    const result = {
      threshold,
      units,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return result;
  }
}
