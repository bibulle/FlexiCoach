import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { Session } from '../schemas/session.schema';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(@Body() session: Partial<Session>) {
    return this.sessionsService.create(session);
  }

  @Get()
  findAll(@Query('userId') userId?: string) {
    return this.sessionsService.findAll(userId);
  }

  @Get('stats')
  getStats(@Query('userId') userId?: string) {
    return this.sessionsService.getStats(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() session: Partial<Session>) {
    return this.sessionsService.update(id, session);
  }

  @Patch(':id/complete')
  complete(
    @Param('id') id: string,
    @Body() body: { completed: boolean; feeling?: number }
  ) {
    return this.sessionsService.complete(id, body.completed, body.feeling);
  }
}
