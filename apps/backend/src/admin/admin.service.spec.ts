import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { UsersService } from '../users/users.service';

describe('AdminService', () => {
  let service: AdminService;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            updatePassword: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should delegate to UsersService.findAll()', async () => {
      const mockUsers = [
        { _id: '1', email: 'user1@example.com', password: 'hash1' },
        { _id: '2', email: 'user2@example.com', password: 'hash2' },
      ];

      usersService.findAll.mockResolvedValue(mockUsers as any);

      const result = await service.getAllUsers();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('resetUserPassword', () => {
    it('should delegate to UsersService.updatePassword()', async () => {
      const userId = 'user123';
      const newPassword = 'newPassword123';
      const updatedUser = { _id: userId, email: 'user@example.com' };

      usersService.updatePassword.mockResolvedValue(updatedUser as any);

      const result = await service.resetUserPassword(userId, newPassword);

      expect(usersService.updatePassword).toHaveBeenCalledWith(
        userId,
        newPassword,
      );
      expect(result).toEqual(updatedUser);
    });
  });
});
