import { Controller, Get, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';

@Controller()
export class AppController {
  constructor() {}

  @Get('/')
  async test(@Req() req: Request, @Res() res: Response) {
    res.status(200).send('Look Mom I Made It');
  }
}
