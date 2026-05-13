import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthCodeStore } from './auth-code.store';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let authCodeStore: jest.Mocked<AuthCodeStore>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            generateToken: jest.fn(),
          },
        },
        {
          provide: AuthCodeStore,
          useValue: {
            generateCode: jest.fn(),
            exchangeCode: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                FRONTEND_URL: 'http://localhost:4200',
                ADMIN_EMAILS: 'admin@example.com',
              };
              return config[key] || '';
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService) as jest.Mocked<AuthService>;
    authCodeStore = module.get(AuthCodeStore) as jest.Mocked<AuthCodeStore>;
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;
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
        user: {
          _id: '123',
          email: registerDto.email,
          displayName: registerDto.displayName,
        },
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
      configService.get.mockImplementation((key: string) => {
        if (key === 'ADMIN_EMAILS')
          return 'admin@example.com,other@example.com';
        return '';
      });

      // Recreate controller to pick up new config
      const module: TestingModule = await Test.createTestingModule({
        controllers: [AuthController],
        providers: [
          { provide: AuthService, useValue: authService },
          { provide: AuthCodeStore, useValue: authCodeStore },
          { provide: ConfigService, useValue: configService },
        ],
      }).compile();
      const ctrl = module.get<AuthController>(AuthController);

      const result = await ctrl.isAdmin(user);
      expect(result).toEqual({ isAdmin: true });
    });

    it('should return false for non-admin email', async () => {
      const user = { _id: '123', email: 'user@example.com' } as any;

      const result = await controller.isAdmin(user);

      expect(result).toEqual({ isAdmin: false });
    });

    it('should handle empty ADMIN_EMAILS', async () => {
      const user = { _id: '123', email: 'user@example.com' } as any;
      configService.get.mockImplementation((key: string) => {
        if (key === 'ADMIN_EMAILS') return '';
        return '';
      });

      const module: TestingModule = await Test.createTestingModule({
        controllers: [AuthController],
        providers: [
          { provide: AuthService, useValue: authService },
          { provide: AuthCodeStore, useValue: authCodeStore },
          { provide: ConfigService, useValue: configService },
        ],
      }).compile();
      const ctrl = module.get<AuthController>(AuthController);

      const result = await ctrl.isAdmin(user);
      expect(result).toEqual({ isAdmin: false });
    });
  });

  describe('exchangeCode', () => {
    it('should return token and user for valid code', async () => {
      const exchangeCodeDto = { code: 'valid-code' };
      const storedData = {
        token: 'jwt-token',
        user: { _id: '123', email: 'test@example.com', displayName: 'Test' },
      };

      authCodeStore.exchangeCode.mockReturnValue(storedData);

      const result = await controller.exchangeCode(exchangeCodeDto);

      expect(authCodeStore.exchangeCode).toHaveBeenCalledWith('valid-code');
      expect(result).toEqual({
        access_token: 'jwt-token',
        user: storedData.user,
      });
    });

    it('should throw UnauthorizedException for invalid code', async () => {
      const exchangeCodeDto = { code: 'invalid-code' };
      authCodeStore.exchangeCode.mockReturnValue(null);

      await expect(controller.exchangeCode(exchangeCodeDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for expired code', async () => {
      const exchangeCodeDto = { code: 'expired-code' };
      authCodeStore.exchangeCode.mockReturnValue(null);

      await expect(controller.exchangeCode(exchangeCodeDto)).rejects.toThrow(
        'Invalid or expired authorization code',
      );
    });
  });

  describe('googleAuthRedirect', () => {
    it('should redirect with a temporary code instead of token in URL', async () => {
      const req = {
        user: {
          _id: { toString: () => 'user123' },
          email: 'test@example.com',
          displayName: 'Test User',
          avatar: 'https://avatar.url',
        },
      };
      const res = { redirect: jest.fn() } as any;

      authService.generateToken.mockReturnValue('jwt-token');
      authCodeStore.generateCode.mockReturnValue('temp-code-abc123');

      await controller.googleAuthRedirect(req as any, res);

      expect(authService.generateToken).toHaveBeenCalledWith({
        sub: 'user123',
        email: 'test@example.com',
      });
      expect(authCodeStore.generateCode).toHaveBeenCalledWith('jwt-token', {
        _id: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        avatar: 'https://avatar.url',
      });
      expect(res.redirect).toHaveBeenCalledWith(
        'http://localhost:4200/auth/callback?code=temp-code-abc123',
      );
    });

    it('should redirect to login on error', async () => {
      const req = { user: null };
      const res = { redirect: jest.fn() } as any;

      await controller.googleAuthRedirect(req as any, res);

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/login?error='),
      );
    });
  });
});
