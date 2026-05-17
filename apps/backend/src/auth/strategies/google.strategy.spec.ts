import { UnauthorizedException } from '@nestjs/common';
import { GoogleStrategy } from './google.strategy';

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;
  let mockAuthService: any;
  let mockConfigService: any;

  beforeEach(() => {
    mockAuthService = {
      validateOAuthUser: jest.fn(),
    };
    mockConfigService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string> = {
          GOOGLE_CLIENT_ID: 'test-client-id',
          GOOGLE_CLIENT_SECRET: 'test-client-secret',
          GOOGLE_CALLBACK_URL: 'http://localhost:3000/api/auth/google/callback',
        };
        return config[key];
      }),
    };

    strategy = new GoogleStrategy(mockConfigService, mockAuthService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const mockDone = jest.fn();

    beforeEach(() => {
      mockDone.mockClear();
    });

    it('should call validateOAuthUser and return user', async () => {
      const mockUser = { _id: 'user-123', email: 'test@gmail.com' };
      mockAuthService.validateOAuthUser.mockResolvedValue(mockUser);

      const profile = {
        id: 'google-123',
        name: { givenName: 'John', familyName: 'Doe' },
        emails: [{ value: 'test@gmail.com', verified: true }],
        photos: [{ value: 'https://photo.url/avatar.jpg' }],
      };

      await strategy.validate('access-token', 'refresh-token', profile as any, mockDone);

      expect(mockAuthService.validateOAuthUser).toHaveBeenCalledWith({
        email: 'test@gmail.com',
        displayName: 'John Doe',
        avatar: 'https://photo.url/avatar.jpg',
        provider: 'google',
        providerId: 'google-123',
      });
      expect(mockDone).toHaveBeenCalledWith(null, mockUser);
    });

    it('should reject unverified email', async () => {
      const profile = {
        id: 'google-123',
        name: { givenName: 'John', familyName: 'Doe' },
        emails: [{ value: 'test@gmail.com', verified: false }],
        photos: [],
      };

      await strategy.validate('access-token', 'refresh-token', profile as any, mockDone);

      expect(mockDone).toHaveBeenCalledWith(
        expect.any(UnauthorizedException),
        false,
      );
      expect(mockAuthService.validateOAuthUser).not.toHaveBeenCalled();
    });

    it('should reject when no emails', async () => {
      const profile = {
        id: 'google-123',
        name: { givenName: 'John', familyName: 'Doe' },
        emails: null,
        photos: [],
      };

      await strategy.validate('access-token', 'refresh-token', profile as any, mockDone);

      expect(mockDone).toHaveBeenCalledWith(
        expect.any(UnauthorizedException),
        false,
      );
    });

    it('should reject when profile.id is empty', async () => {
      const profile = {
        id: '',
        name: { givenName: 'John', familyName: 'Doe' },
        emails: [{ value: 'test@gmail.com', verified: true }],
        photos: [],
      };

      await strategy.validate('access-token', 'refresh-token', profile as any, mockDone);

      expect(mockDone).toHaveBeenCalledWith(
        expect.any(UnauthorizedException),
        false,
      );
    });

    it('should handle validateOAuthUser error', async () => {
      const error = new Error('DB error');
      mockAuthService.validateOAuthUser.mockRejectedValue(error);

      const profile = {
        id: 'google-123',
        name: { givenName: 'John', familyName: 'Doe' },
        emails: [{ value: 'test@gmail.com', verified: true }],
        photos: [{ value: 'https://photo.url/avatar.jpg' }],
      };

      await strategy.validate('access-token', 'refresh-token', profile as any, mockDone);

      expect(mockDone).toHaveBeenCalledWith(error, false);
    });

    it('should handle missing name parts gracefully', async () => {
      const mockUser = { _id: 'user-123', email: 'test@gmail.com' };
      mockAuthService.validateOAuthUser.mockResolvedValue(mockUser);

      const profile = {
        id: 'google-123',
        name: {},
        emails: [{ value: 'test@gmail.com', verified: true }],
        photos: [],
      };

      await strategy.validate('access-token', 'refresh-token', profile as any, mockDone);

      expect(mockAuthService.validateOAuthUser).toHaveBeenCalledWith(
        expect.objectContaining({ displayName: '' }),
      );
    });
  });
});
