import { AdminGuard } from './admin.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let mockExecutionContext: ExecutionContext;

  beforeEach(() => {
    guard = new AdminGuard();

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
      }),
    } as any;
  });

  afterEach(() => {
    delete process.env.ADMIN_EMAILS;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if user is admin', () => {
      process.env.ADMIN_EMAILS = 'admin@example.com,another@example.com';

      const mockRequest = {
        user: {
          email: 'admin@example.com',
          _id: '123',
        },
      };

      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return true if user email is in ADMIN_EMAILS with spaces', () => {
      process.env.ADMIN_EMAILS = ' admin@example.com , another@example.com ';

      const mockRequest = {
        user: {
          email: 'admin@example.com',
          _id: '123',
        },
      };

      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException if user is not authenticated', () => {
      const mockRequest = {
        user: null,
      };

      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        new ForbiddenException('User not authenticated'),
      );
    });

    it('should throw ForbiddenException if user is not admin', () => {
      process.env.ADMIN_EMAILS = 'admin@example.com';

      const mockRequest = {
        user: {
          email: 'regular@example.com',
          _id: '123',
        },
      };

      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        new ForbiddenException('Admin access required'),
      );
    });

    it('should throw ForbiddenException if ADMIN_EMAILS is empty', () => {
      process.env.ADMIN_EMAILS = '';

      const mockRequest = {
        user: {
          email: 'admin@example.com',
          _id: '123',
        },
      };

      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        new ForbiddenException('Admin access required'),
      );
    });

    it('should throw ForbiddenException if ADMIN_EMAILS is not set', () => {
      delete process.env.ADMIN_EMAILS;

      const mockRequest = {
        user: {
          email: 'admin@example.com',
          _id: '123',
        },
      };

      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        new ForbiddenException('Admin access required'),
      );
    });
  });
});
