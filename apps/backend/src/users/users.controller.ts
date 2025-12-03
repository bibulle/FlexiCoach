import {
  Controller,
  Get,
  Body,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../schemas/user.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: User) {
    return this.usersService.findOne(user._id.toString());
  }

  @Patch('me')
  updateProfile(@CurrentUser() user: User, @Body() updateData: Partial<User>) {
    return this.usersService.update(user._id.toString(), updateData);
  }

  @Patch('me/settings')
  updateSettings(
    @CurrentUser() user: User,
    @Body() settings: Partial<User['settings']>
  ) {
    return this.usersService.updateSettings(user._id.toString(), settings);
  }

  @Patch('me/password')
  async updatePassword(
    @CurrentUser() user: User,
    @Body() body: { newPassword: string }
  ) {
    return this.usersService.updatePassword(user._id.toString(), body.newPassword);
  }
}
