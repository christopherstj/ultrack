import {
  Body,
  Controller,
  Get,
  Inject,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthorizedRequest, SuccessMessage } from '@ultrack/libs';
import { Response } from 'express';
import { lastValueFrom } from 'rxjs';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(@Inject('USERS_SERVICE') private usersCLient: ClientProxy) {}

  @UseGuards(AuthGuard)
  @Get('threshold')
  async getThresholdAsync(@Req() req: AuthorizedRequest, @Res() res: Response) {
    const result = this.usersCLient.send<{ threshold: number }>(
      'get-threshold',
      {
        user: req.payload!.email,
      },
    );
    const response = await lastValueFrom(result);
    if (response) {
      res.status(200).send(response);
    } else {
      res.status(500).send('Error getting threshold');
    }
  }

  @UseGuards(AuthGuard)
  @Get('units')
  async getUnitsAsync(@Req() req: AuthorizedRequest, @Res() res: Response) {
    const result = this.usersCLient.send<{ units: string }>('get-units', {
      user: req.payload!.email,
    });
    const response = await lastValueFrom(result);
    if (response) {
      res.status(200).send(response);
    } else {
      res.status(500).send('Error getting units');
    }
  }

  @UseGuards(AuthGuard)
  @Put()
  async updateUserAsync(
    @Body()
    body: {
      password?: string;
      confirmPassword?: string;
      firstName?: string;
      lastName?: string;
    },
    @Req() req: AuthorizedRequest,
    @Res() res: Response,
  ) {
    const result = this.usersCLient.send<SuccessMessage>('local/update-user', {
      ...body,
      email: req.payload!.email,
    });
    const message = await lastValueFrom(result);
    if (message.success) {
      res.status(200).send(message);
    } else {
      res.status(500).send(message);
    }
  }

  @UseGuards(AuthGuard)
  @Put('threshold')
  async updateThresholdAsync(
    @Body() body: { threshold: number },
    @Req() req: AuthorizedRequest,
    @Res() res: Response,
  ) {
    const result = this.usersCLient.send<SuccessMessage>('set-threshold', {
      ...body,
      user: req.payload!.email,
    });
    const success = await lastValueFrom(result);
    if (success.success) {
      res.status(200).send(success);
    } else {
      res.status(500).send('Error setting threshold');
    }
  }

  @UseGuards(AuthGuard)
  @Put('units')
  async updateUnitsAsync(
    @Body() body: { units: 'mi' | 'km' },
    @Req() req: AuthorizedRequest,
    @Res() res: Response,
  ) {
    const result = this.usersCLient.send<SuccessMessage>('set-units', {
      ...body,
      user: req.payload!.email,
    });
    const success = await lastValueFrom(result);
    if (success.success) {
      res.status(200).send(success);
    } else {
      res.status(500).send('Error setting units');
    }
  }
}
