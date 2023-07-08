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
    firstName: string,
    lastName: string,
  ): Promise<any> {
    const successMessage: SuccessMessage = await firstValueFrom(
      this.usersServiceClient.send('local/create-user', {
        email,
        password,
        confirmPassword,
        firstName,
        lastName,
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
}
