import { AllExceptionsFilter } from './all-exceptions.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Logger } from 'winston';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockLogger: jest.Mocked<Logger>;
  let mockArgumentsHost: ArgumentsHost;
  let mockResponse: any;
  let mockRequest: any;

  beforeEach(() => {
    mockLogger = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
    } as any;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      url: '/test',
      method: 'GET',
      get: jest.fn((header: string) => {
        if (header === 'user-agent') return 'test-agent';
        return undefined;
      }),
      ip: '127.0.0.1',
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as any;

    filter = new AllExceptionsFilter(mockLogger);

    // Clear NODE_ENV before each test
    delete process.env.NODE_ENV;
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('should handle HttpException correctly', () => {
      const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          error: 'HttpException',
          message: 'Not found',
          path: '/test',
        })
      );
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle HttpException with object response', () => {
      const exception = new HttpException(
        { message: 'Validation failed', error: 'Bad Request' },
        HttpStatus.BAD_REQUEST
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
        })
      );
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle standard Error as 500', () => {
      const exception = new Error('Unexpected error');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          error: 'Error',
          message: 'Unexpected error',
        })
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should log errors with status >= 500 as error level', () => {
      const exception = new HttpException(
        'Internal error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Server error occurred',
        expect.objectContaining({
          statusCode: 500,
          error: 'HttpException',
          message: 'Internal error',
        })
      );
    });

    it('should log errors with status >= 400 and < 500 as warn level', () => {
      const exception = new HttpException('Bad request', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Client error occurred',
        expect.objectContaining({
          statusCode: 400,
          error: 'HttpException',
          message: 'Bad request',
        })
      );
    });

    it('should sanitize 500 errors in production', () => {
      process.env.NODE_ENV = 'production';

      const exception = new Error('Database connection failed');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'An unexpected error occurred',
          statusCode: 500,
        })
      );
    });

    it('should not sanitize 400 errors in production', () => {
      process.env.NODE_ENV = 'production';

      const exception = new HttpException('Validation error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation error',
          statusCode: 400,
        })
      );
    });

    it('should include timestamp and path in response', () => {
      const exception = new HttpException('Test', HttpStatus.NOT_FOUND);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
          path: '/test',
        })
      );
    });

    it('should log request details', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Client error occurred',
        expect.objectContaining({
          path: '/test',
          method: 'GET',
          userAgent: 'test-agent',
          ip: '127.0.0.1',
        })
      );
    });
  });
});
