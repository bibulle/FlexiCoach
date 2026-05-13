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
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { CompleteSessionDto } from './dto/complete-session.dto';
import { CalendarQueryDto } from './dto/calendar-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../schemas/user.schema';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(
    @CurrentUser() user: User,
    @Body() createSessionDto: CreateSessionDto,
  ) {
    return this.sessionsService.create({
      ...createSessionDto,
      userId: user._id.toString(),
    });
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
  getCalendar(@CurrentUser() user: User, @Query() query: CalendarQueryDto) {
    return this.sessionsService.getCalendar(
      user._id.toString(),
      query.from,
      query.to,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto) {
    return this.sessionsService.update(id, updateSessionDto);
  }

  @Patch(':id/complete')
  complete(
    @Param('id') id: string,
    @Body() completeSessionDto: CompleteSessionDto,
  ) {
    return this.sessionsService.complete(
      id,
      completeSessionDto.completed,
      completeSessionDto.feeling,
    );
  }
}
