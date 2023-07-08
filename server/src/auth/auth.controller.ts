import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthorizedRequest } from '@ultrack/libs';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  async signUp(
    @Body()
    signInDto: {
      email: string;
      password: string;
      confirmPassword: string;
      firstName: string;
      lastName: string;
    },
  ) {
    const result = await this.authService.createUser(
      signInDto.email,
      signInDto.password,
      signInDto.confirmPassword,
      signInDto.firstName,
      signInDto.lastName,
    );
    return result;
  }

  @Post('login')
  async signIn(@Body() signInDto: { email: string; password: string }) {
    const result = await this.authService.signIn(
      signInDto.email,
      signInDto.password,
    );
    return result;
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req: AuthorizedRequest) {
    return req.payload;
  }
}
