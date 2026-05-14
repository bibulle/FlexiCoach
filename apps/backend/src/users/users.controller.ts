import {
  Controller,
  Get,
  Body,
  Patch,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../schemas/user.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: User) {
    return this.usersService.findOne(user._id.toString());
  }

  @Patch('me')
  updateProfile(
    @CurrentUser() user: User,
    @Body() updateData: UpdateProfileDto,
  ) {
    return this.usersService.update(user._id.toString(), updateData);
  }

  @Patch('me/settings')
  updateSettings(
    @CurrentUser() user: User,
    @Body() settings: Partial<User['settings']>,
  ) {
    return this.usersService.updateSettings(user._id.toString(), settings);
  }

  @Patch('me/password')
  async updatePassword(
    @CurrentUser() user: User,
    @Body() body: UpdatePasswordDto,
  ) {
    const isValid = await this.usersService.verifyPassword(
      user._id.toString(),
      body.currentPassword,
    );
    if (!isValid) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }
    return this.usersService.updatePassword(
      user._id.toString(),
      body.newPassword,
    );
  }
}
