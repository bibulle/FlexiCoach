import { HttpLoggerMiddleware } from './http-logger.middleware';
import { Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';

describe('HttpLoggerMiddleware', () => {
  let middleware: HttpLoggerMiddleware;
  let mockLogger: jest.Mocked<Logger>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let responseFinishCallback: () => void;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as any;

    mockRequest = {
      method: 'GET',
      originalUrl: '/test',
      ip: '127.0.0.1',
      get: jest.fn((header: string) => {
        if (header === 'user-agent') return 'test-agent';
        return undefined;
      }) as any,
    };

    mockResponse = {
      statusCode: 200,
      on: jest.fn((event: string, callback: () => void) => {
        if (event === 'finish') {
          responseFinishCallback = callback;
        }
        return mockResponse as Response;
      }),
    };

    mockNext = jest.fn();

    middleware = new HttpLoggerMiddleware(mockLogger);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  describe('use', () => {
    it('should call next()', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should log with info level for 2xx responses', () => {
      mockResponse.statusCode = 200;

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      // Simulate response finish
      responseFinishCallback();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'HTTP Request',
        expect.objectContaining({
          method: 'GET',
          url: '/test',
          statusCode: 200,
          ip: '127.0.0.1',
          userAgent: 'test-agent',
        })
      );
    });

    it('should log with info level for 3xx responses', () => {
      mockResponse.statusCode = 301;

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      // Simulate response finish
      responseFinishCallback();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'HTTP Request',
        expect.objectContaining({
          statusCode: 301,
        })
      );
    });

    it('should log with warn level for 4xx responses', () => {
      mockResponse.statusCode = 404;

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      // Simulate response finish
      responseFinishCallback();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'HTTP Request',
        expect.objectContaining({
          statusCode: 404,
        })
      );
    });

    it('should log with error level for 5xx responses', () => {
      mockResponse.statusCode = 500;

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      // Simulate response finish
      responseFinishCallback();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'HTTP Request',
        expect.objectContaining({
          statusCode: 500,
        })
      );
    });

    it('should include duration in log', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      // Simulate response finish
      responseFinishCallback();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'HTTP Request',
        expect.objectContaining({
          duration: expect.stringMatching(/^\d+ms$/),
        })
      );
    });

    it('should handle missing user-agent', () => {
      (mockRequest.get as jest.Mock).mockReturnValue(undefined);

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      // Simulate response finish
      responseFinishCallback();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'HTTP Request',
        expect.objectContaining({
          userAgent: '',
        })
      );
    });

    it('should log all request details', () => {
      mockRequest = {
        ...mockRequest,
        method: 'POST',
        originalUrl: '/api/users',
        ip: '192.168.1.1',
      };
      mockResponse.statusCode = 201;

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      // Simulate response finish
      responseFinishCallback();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'HTTP Request',
        expect.objectContaining({
          method: 'POST',
          url: '/api/users',
          statusCode: 201,
          ip: '192.168.1.1',
          userAgent: 'test-agent',
          duration: expect.any(String),
        })
      );
    });

    it('should register finish listener on response', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.on).toHaveBeenCalledWith('finish', expect.any(Function));
    });
  });
});
