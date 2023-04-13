import {
  Body,
  Controller,
  Inject,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthorizedRequest } from '@ultrack/libs';
import { Response } from 'express';
import { lastValueFrom } from 'rxjs';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(
    @Inject('WORKOUTS_SERVICE') private workoutsClient: ClientProxy,
  ) {}

  @UseGuards(AuthGuard)
  @Put('threshold')
  async updateThresholdAsync(
    @Body() body: { threshold: number },
    @Req() req: AuthorizedRequest,
    @Res() res: Response,
  ) {
    const result = this.workoutsClient.send<{
      success: boolean;
    }>('set-threshold', { ...body, user: req.payload!.email });
    const success = await lastValueFrom(result);
    if (success.success) {
      res.status(200).send(success);
    } else {
      res.status(500).send('Error setting threshold');
    }
  }
}
