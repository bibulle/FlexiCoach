import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../schemas/user.schema';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { ImportRoutineDto } from './dto/import-routine.dto';

@Controller('routines')
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createRoutineDto: CreateRoutineDto,
    @CurrentUser() user: User,
  ) {
    return this.routinesService.create(createRoutineDto, user._id);
  }

  @Post('import')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async import(
    @Body() importRoutineDto: ImportRoutineDto,
    @CurrentUser() user: User,
  ) {
    if (importRoutineDto.version !== '1.0') {
      throw new BadRequestException(
        'Unsupported version. Only version 1.0 is supported.',
      );
    }
    return this.routinesService.create(importRoutineDto.routine, user._id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@CurrentUser() user: User) {
    return this.routinesService.findAllForUser(user._id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const routine = await this.routinesService.findOne(id);
    if (!routine) {
      throw new NotFoundException('Routine not found');
    }

    // Allow access to built-in routines or user's own routines
    if (
      routine.visibility === 'user' &&
      routine.ownerId !== user._id.toString().toString()
    ) {
      throw new ForbiddenException('Access denied to this routine');
    }

    return routine;
  }

  @Get('slug/:slug')
  @UseGuards(JwtAuthGuard)
  async findBySlug(@Param('slug') slug: string, @CurrentUser() user: User) {
    const routine = await this.routinesService.findBySlug(slug);
    if (!routine) {
      throw new NotFoundException('Routine not found');
    }

    // Allow access to built-in routines or user's own routines
    if (
      routine.visibility === 'user' &&
      routine.ownerId !== user._id.toString()
    ) {
      throw new ForbiddenException('Access denied to this routine');
    }

    return routine;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateRoutineDto: UpdateRoutineDto,
    @CurrentUser() user: User,
  ) {
    const routine = await this.routinesService.findOne(id);
    if (!routine) {
      throw new NotFoundException('Routine not found');
    }

    // Only allow updating user's own routines
    if (routine.ownerId !== user._id.toString()) {
      throw new ForbiddenException('You can only update your own routines');
    }

    return this.routinesService.update(id, updateRoutineDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    const routine = await this.routinesService.findOne(id);
    if (!routine) {
      throw new NotFoundException('Routine not found');
    }

    // Only allow deleting user's own routines
    if (routine.ownerId !== user._id.toString()) {
      throw new ForbiddenException('You can only delete your own routines');
    }

    await this.routinesService.remove(id);
  }
}
