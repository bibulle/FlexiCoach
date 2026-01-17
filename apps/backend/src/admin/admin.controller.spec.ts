import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../schemas/user.schema';

describe('AdminController', () => {
  let controller: AdminController;
  let service: jest.Mocked<AdminService>;

  const mockUser: User = {
    _id: '123',
    email: 'test@example.com',
    displayName: 'Test User',
  } as any;

  beforeEach(async () => {
    const mockService = {
      getAllUsers: jest.fn(),
      resetUserPassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get(AdminService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      service.getAllUsers.mockResolvedValue(users);

      const result = await controller.getAllUsers();

      expect(result).toEqual(users);
      expect(service.getAllUsers).toHaveBeenCalled();
    });
  });

  describe('resetUserPassword', () => {
    it('should reset user password', async () => {
      const userId = '123';
      const newPassword = 'NewPassword123';
      const updatedUser = { ...mockUser };

      service.resetUserPassword.mockResolvedValue(updatedUser);

      const result = await controller.resetUserPassword(userId, {
        newPassword,
      });

      expect(result).toEqual(updatedUser);
      expect(service.resetUserPassword).toHaveBeenCalledWith(
        userId,
        newPassword
      );
    });
  });
});
