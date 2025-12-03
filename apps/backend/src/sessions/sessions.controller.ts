import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { Session } from '../schemas/session.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../schemas/user.schema';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() session: Partial<Session>) {
    return this.sessionsService.create({ ...session, userId: user._id.toString() });
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.sessionsService.findAll(user._id.toString());
  }

  @Get('stats')
  getStats(@CurrentUser() user: User) {
    return this.sessionsService.getStats(user._id.toString());
  }

  @Get('stats/summary')
  getSummary(@CurrentUser() user: User) {
    return this.sessionsService.getSummary(user._id.toString());
  }

  @Get('calendar')
  getCalendar(
    @CurrentUser() user: User,
    @Query('from') from?: string,
    @Query('to') to?: string
  ) {
    return this.sessionsService.getCalendar(user._id.toString(), from, to);
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
