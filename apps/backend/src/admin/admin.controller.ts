import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Patch('users/:userId/password')
  resetUserPassword(
    @Param('userId') userId: string,
    @Body() body: ResetPasswordDto,
  ) {
    return this.adminService.resetUserPassword(userId, body.newPassword);
  }
}
