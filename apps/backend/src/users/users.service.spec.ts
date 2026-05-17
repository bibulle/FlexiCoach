import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from '../schemas/user.schema';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let mockUserModel: any;

  const mockUser = {
    _id: 'user-mongo-id',
    email: 'test@example.com',
    password: 'hashedPassword123',
    displayName: 'Test User',
    tz: 'Europe/Paris',
    isAdmin: false,
    settings: {
      theme: 'light',
      voiceRate: 1,
      sound: true,
    },
    toString: () => 'user-mongo-id',
  };

  beforeEach(async () => {
    // Reset bcrypt mock
    (bcrypt.hash as jest.Mock).mockReset();

    // Create mock functions
    const mockExec = jest.fn();
    const mockSelect = jest.fn().mockReturnValue({ exec: mockExec });
    const mockFind = jest.fn().mockReturnValue({ exec: mockExec });
    const mockFindOne = jest
      .fn()
      .mockReturnValue({ exec: mockExec, select: mockSelect });
    const mockFindById = jest.fn().mockReturnValue({ exec: mockExec });
    const mockFindByIdAndUpdate = jest.fn().mockReturnValue({ exec: mockExec });
    const mockFindByIdAndDelete = jest.fn().mockReturnValue({ exec: mockExec });

    // Create a mock model constructor
    mockUserModel = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: 'new-user-id',
      tz: data.tz || 'Europe/Paris',
      save: jest.fn().mockResolvedValue({
        ...mockUser,
        ...data,
        _id: 'new-user-id',
        tz: data.tz || 'Europe/Paris',
      }),
    }));
    mockUserModel.find = mockFind;
    mockUserModel.findOne = mockFindOne;
    mockUserModel.findById = mockFindById;
    mockUserModel.findByIdAndUpdate = mockFindByIdAndUpdate;
    mockUserModel.findByIdAndDelete = mockFindByIdAndDelete;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedPassword123',
        displayName: 'Test User',
      };

      const result = await service.create(userData);

      expect(result).toBeDefined();
      expect(result._id).toBeDefined();
      expect(result.email).toBe(userData.email);
      expect(result.password).toBe(userData.password);
      expect(result.displayName).toBe(userData.displayName);
      expect(result.tz).toBe('Europe/Paris'); // default value
      expect(mockUserModel).toHaveBeenCalledWith(userData);
    });

    it('should create user without displayName', async () => {
      const userData = {
        email: 'minimal@example.com',
        password: 'password123',
      };

      const result = await service.create(userData);

      expect(result.email).toBe(userData.email);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { ...mockUser, email: 'user1@example.com' },
        { ...mockUser, email: 'user2@example.com' },
      ];
      mockUserModel.find().exec.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].email).toBe('user1@example.com');
      expect(result[1].email).toBe('user2@example.com');
      expect(mockUserModel.find).toHaveBeenCalled();
    });

    it('should return empty array when no users exist', async () => {
      mockUserModel.find().exec.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should find user by ID', async () => {
      mockUserModel.findById().exec.mockResolvedValue(mockUser);

      const result = await service.findOne('user-mongo-id');

      expect(result).toBeDefined();
      expect(result?.email).toBe('test@example.com');
      expect(mockUserModel.findById).toHaveBeenCalledWith('user-mongo-id');
    });

    it('should return null for non-existent ID', async () => {
      mockUserModel.findById().exec.mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      mockUserModel.findOne().exec.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toBeDefined();
      expect(result?.email).toBe('test@example.com');
      expect(result?.displayName).toBe('Test User');
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });

    it('should return null for non-existent email', async () => {
      mockUserModel.findOne().exec.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByEmailWithPassword', () => {
    it('should include password field', async () => {
      const userWithPassword = { ...mockUser, password: 'secretPassword' };
      mockUserModel.findOne().select().exec.mockResolvedValue(userWithPassword);

      const result = await service.findByEmailWithPassword('test@example.com');

      expect(result).toBeDefined();
      expect(result?.email).toBe('test@example.com');
      expect((result as any).password).toBe('secretPassword');
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updatedUser = {
        ...mockUser,
        displayName: 'Updated Name',
        tz: 'America/New_York',
      };
      mockUserModel.findByIdAndUpdate().exec.mockResolvedValue(updatedUser);

      const result = await service.update('user-mongo-id', {
        displayName: 'Updated Name',
        tz: 'America/New_York',
      });

      expect(result).toBeDefined();
      expect(result?.displayName).toBe('Updated Name');
      expect(result?.tz).toBe('America/New_York');
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'user-mongo-id',
        { displayName: 'Updated Name', tz: 'America/New_York' },
        { new: true },
      );
    });

    it('should return null for non-existent ID', async () => {
      mockUserModel.findByIdAndUpdate().exec.mockResolvedValue(null);

      const result = await service.update('non-existent-id', {
        displayName: 'Test',
      });

      expect(result).toBeNull();
    });

    it('should update only provided fields', async () => {
      mockUserModel.findByIdAndUpdate().exec.mockResolvedValue({
        ...mockUser,
        displayName: 'New Name',
      });

      await service.update('user-mongo-id', { displayName: 'New Name' });

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'user-mongo-id',
        { displayName: 'New Name' },
        { new: true },
      );
    });
  });

  describe('updateSettings', () => {
    it('should update user settings', async () => {
      const settings = {
        theme: 'dark' as const,
        voiceRate: 1.2,
        sound: true,
      };

      const updatedUser = {
        ...mockUser,
        settings,
      };
      mockUserModel.findByIdAndUpdate().exec.mockResolvedValue(updatedUser);

      const result = await service.updateSettings('user-mongo-id', settings);

      expect(result).toBeDefined();
      expect(result?.settings?.theme).toBe('dark');
      expect(result?.settings?.voiceRate).toBe(1.2);
      expect(result?.settings?.sound).toBe(true);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'user-mongo-id',
        { $set: { 'settings.theme': 'dark', 'settings.voiceRate': 1.2, 'settings.sound': true } },
        { new: true },
      );
    });

    it('should update partial settings', async () => {
      const partialSettings = { theme: 'dark' as const };
      mockUserModel.findByIdAndUpdate().exec.mockResolvedValue({
        ...mockUser,
        settings: { ...mockUser.settings, ...partialSettings },
      });

      await service.updateSettings('user-mongo-id', partialSettings);

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'user-mongo-id',
        { $set: { 'settings.theme': 'dark' } },
        { new: true },
      );
    });
  });

  describe('updatePassword', () => {
    it('should hash and update password', async () => {
      const newPassword = 'newPassword123';
      const hashedPassword = 'hashedNewPassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const updatedUser = { ...mockUser, password: hashedPassword };
      mockUserModel.findByIdAndUpdate().exec.mockResolvedValue(updatedUser);

      const result = await service.updatePassword('user-mongo-id', newPassword);

      expect(result).toBeDefined();
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'user-mongo-id',
        { password: hashedPassword },
        { new: true },
      );
    });

    it('should return null for non-existent user', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockUserModel.findByIdAndUpdate().exec.mockResolvedValue(null);

      const result = await service.updatePassword(
        'non-existent-id',
        'newPassword',
      );

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete user', async () => {
      mockUserModel.findByIdAndDelete().exec.mockResolvedValue(mockUser);

      const result = await service.remove('user-mongo-id');

      expect(result).toBeDefined();
      expect(result?.email).toBe('test@example.com');
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(
        'user-mongo-id',
      );
    });

    it('should return null for non-existent ID', async () => {
      mockUserModel.findByIdAndDelete().exec.mockResolvedValue(null);

      const result = await service.remove('non-existent-id');

      expect(result).toBeNull();
    });
  });
});
