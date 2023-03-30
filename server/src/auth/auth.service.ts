import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/users/user.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findLocalUser(email);

    if (!user) throw new UnauthorizedException();

    const success = await bcrypt.compare(pass, user.hashedPassword);

    if (!success) throw new UnauthorizedException();

    const payload = { email: user.email };

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}
