import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersServiceClient: ClientProxy,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<any> {
    try {
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
    } catch (err) {
      console.error(err);
    }
  }
}
