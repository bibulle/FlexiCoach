import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../users/users.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-jwt-secret'),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user when valid payload', async () => {
      const mockUser = { _id: 'user-123', email: 'test@example.com' };
      usersService.findOne.mockResolvedValue(mockUser as any);

      const result = await strategy.validate({
        sub: 'user-123',
        email: 'test@example.com',
      });

      expect(usersService.findOne).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      usersService.findOne.mockResolvedValue(null);

      await expect(
        strategy.validate({ sub: 'non-existent', email: 'x@example.com' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('constructor', () => {
    it('should throw if JWT_SECRET is not set', () => {
      expect(
        () =>
          new JwtStrategy(
            {} as any,
            { get: () => undefined } as any,
          ),
      ).toThrow('JWT_SECRET environment variable is required.');
    });
  });
});
