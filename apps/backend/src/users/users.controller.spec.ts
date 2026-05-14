import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
            updateSettings: jest.fn(),
            updatePassword: jest.fn(),
            verifyPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should call usersService.findOne with user id', async () => {
      const user = { _id: '123', email: 'test@example.com' } as any;
      const userProfile = {
        _id: '123',
        email: 'test@example.com',
        displayName: 'Test',
      };

      usersService.findOne.mockResolvedValue(userProfile as any);

      const result = await controller.getProfile(user);

      expect(usersService.findOne).toHaveBeenCalledWith('123');
      expect(result).toEqual(userProfile);
    });
  });

  describe('updateProfile', () => {
    it('should call usersService.update with user id and whitelisted data', async () => {
      const user = { _id: '123', email: 'test@example.com' } as any;
      const updateData = { displayName: 'New Name' };
      const updatedUser = {
        _id: '123',
        email: 'test@example.com',
        displayName: 'New Name',
      };

      usersService.update.mockResolvedValue(updatedUser as any);

      const result = await controller.updateProfile(user, updateData);

      expect(usersService.update).toHaveBeenCalledWith('123', updateData);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('updateSettings', () => {
    it('should call usersService.updateSettings with user id and settings', async () => {
      const user = { _id: '123', email: 'test@example.com' } as any;
      const settings = { theme: 'dark' as const, sound: true };
      const updatedUser = {
        _id: '123',
        email: 'test@example.com',
        settings,
      };

      usersService.updateSettings.mockResolvedValue(updatedUser as any);

      const result = await controller.updateSettings(user, settings);

      expect(usersService.updateSettings).toHaveBeenCalledWith('123', settings);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('updatePassword', () => {
    it('should update password when current password is correct', async () => {
      const user = { _id: '123', email: 'test@example.com' } as any;
      const body = { currentPassword: 'OldPass123', newPassword: 'NewPassword123' };
      const updatedUser = { _id: '123', email: 'test@example.com' };

      usersService.verifyPassword.mockResolvedValue(true);
      usersService.updatePassword.mockResolvedValue(updatedUser as any);

      const result = await controller.updatePassword(user, body);

      expect(usersService.verifyPassword).toHaveBeenCalledWith('123', 'OldPass123');
      expect(usersService.updatePassword).toHaveBeenCalledWith(
        '123',
        'NewPassword123',
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw UnauthorizedException when current password is wrong', async () => {
      const user = { _id: '123', email: 'test@example.com' } as any;
      const body = { currentPassword: 'WrongPass', newPassword: 'NewPassword123' };

      usersService.verifyPassword.mockResolvedValue(false);

      await expect(controller.updatePassword(user, body)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.updatePassword).not.toHaveBeenCalled();
    });
  });
});
