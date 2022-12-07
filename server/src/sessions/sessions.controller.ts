import { Body, Controller, Get, Post } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { Session } from './session.model';

@Controller('session')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('create')
  async createRecord(@Body('text') text: string): Promise<Session> {
    return this.sessionsService.createNewRecord(text);
  }
}
