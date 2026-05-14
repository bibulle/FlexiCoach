import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findByEmailWithPassword: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user with valid data', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Password123',
        displayName: 'Test User',
      };

      const createdUser = {
        _id: 'user123',
        email: registerDto.email,
        displayName: registerDto.displayName,
      };

      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(createdUser as any);
      jwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.register(registerDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(usersService.create).toHaveBeenCalledWith({
        email: registerDto.email,
        password: expect.any(String), // hashed password
        displayName: registerDto.displayName,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: createdUser._id,
        email: createdUser.email,
      });
      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user: {
          _id: createdUser._id,
          email: createdUser.email,
          displayName: createdUser.displayName,
        },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'Password123',
      };

      usersService.findByEmail.mockResolvedValue({
        _id: 'existing-user',
      } as any);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'Email already exists',
      );
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const loginDto = {
        email: 'user@example.com',
        password: 'Password123',
      };

      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const user = {
        _id: 'user123',
        email: loginDto.email,
        password: hashedPassword,
        displayName: 'Test User',
      };

      usersService.findByEmailWithPassword.mockResolvedValue(user as any);
      jwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login(loginDto);

      expect(usersService.findByEmailWithPassword).toHaveBeenCalledWith(
        loginDto.email,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user._id,
        email: user.email,
      });
      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user: {
          _id: user._id,
          email: user.email,
          displayName: user.displayName,
        },
      });
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const loginDto = {
        email: 'user@example.com',
        password: 'WrongPassword',
      };

      const hashedPassword = await bcrypt.hash('CorrectPassword', 10);
      const user = {
        _id: 'user123',
        email: loginDto.email,
        password: hashedPassword,
      };

      usersService.findByEmailWithPassword.mockResolvedValue(user as any);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'Password123',
      };

      usersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('generateToken', () => {
    it('should call jwtService.sign and return the token', () => {
      const payload = { sub: 'user123', email: 'test@example.com' };
      jwtService.sign.mockReturnValue('generated-jwt-token');

      const result = service.generateToken(payload);

      expect(jwtService.sign).toHaveBeenCalledWith(payload);
      expect(result).toBe('generated-jwt-token');
    });
  });

  describe('validateUser', () => {
    it('should return user without password for valid credentials', async () => {
      const email = 'user@example.com';
      const password = 'Password123';

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = {
        _id: 'user123',
        email,
        password: hashedPassword,
        displayName: 'Test User',
      };

      usersService.findByEmailWithPassword.mockResolvedValue(user as any);

      const result = await service.validateUser(email, password);

      expect(result).toBeDefined();
      expect(result.password).toBeUndefined();
      expect(result.email).toBe(email);
      expect(result._id).toBe(user._id);
    });

    it('should return null for invalid credentials', async () => {
      const email = 'user@example.com';
      const password = 'WrongPassword';

      const hashedPassword = await bcrypt.hash('CorrectPassword', 10);
      const user = {
        _id: 'user123',
        email,
        password: hashedPassword,
      };

      usersService.findByEmailWithPassword.mockResolvedValue(user as any);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });
  });
});
