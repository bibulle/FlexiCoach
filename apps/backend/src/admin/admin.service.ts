import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../schemas/user.schema';

@Injectable()
export class AdminService {
  constructor(private readonly usersService: UsersService) {}

  async getAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  async resetUserPassword(userId: string, newPassword: string): Promise<User | null> {
    return this.usersService.updatePassword(userId, newPassword);
  }
}
