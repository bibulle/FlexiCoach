import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService) as jest.Mocked<AuthService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Password123',
        displayName: 'Test User',
      };

      const authResponse = {
        access_token: 'token',
        user: { _id: '123', email: registerDto.email, displayName: registerDto.displayName },
      };

      authService.register.mockResolvedValue(authResponse);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(authResponse);
    });
  });

  describe('login', () => {
    it('should call authService.login', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const authResponse = {
        access_token: 'token',
        user: { _id: '123', email: loginDto.email },
      };

      authService.login.mockResolvedValue(authResponse);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(authResponse);
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin email', async () => {
      const user = { _id: '123', email: 'admin@example.com' } as any;
      process.env.ADMIN_EMAILS = 'admin@example.com,other@example.com';

      const result = await controller.isAdmin(user);

      expect(result).toEqual({ isAdmin: true });
    });

    it('should return false for non-admin email', async () => {
      const user = { _id: '123', email: 'user@example.com' } as any;
      process.env.ADMIN_EMAILS = 'admin@example.com';

      const result = await controller.isAdmin(user);

      expect(result).toEqual({ isAdmin: false });
    });

    it('should handle empty ADMIN_EMAILS', async () => {
      const user = { _id: '123', email: 'user@example.com' } as any;
      process.env.ADMIN_EMAILS = '';

      const result = await controller.isAdmin(user);

      expect(result).toEqual({ isAdmin: false });
    });
  });
});
