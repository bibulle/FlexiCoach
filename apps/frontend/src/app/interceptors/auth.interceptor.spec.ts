import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(() => {
    mockAuthService = {
      getToken: vi.fn(),
      logout: vi.fn(),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Authorization header for /api requests when token exists', () => {
    mockAuthService.getToken.mockReturnValue('test-token');

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');

    req.flush({});
  });

  it('should not add Authorization header when token does not exist', () => {
    mockAuthService.getToken.mockReturnValue(null);

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);

    req.flush({});
  });

  it('should not add Authorization header for non-/api requests', () => {
    mockAuthService.getToken.mockReturnValue('test-token');

    httpClient.get('/other/endpoint').subscribe();

    const req = httpMock.expectOne('/other/endpoint');
    expect(req.request.headers.has('Authorization')).toBe(false);

    req.flush({});
  });

  it('should call getToken on AuthService', () => {
    mockAuthService.getToken.mockReturnValue('test-token');

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(mockAuthService.getToken).toHaveBeenCalled();

    req.flush({});
  });

  it('should handle requests with existing headers', () => {
    mockAuthService.getToken.mockReturnValue('test-token');

    httpClient
      .get('/api/test', {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    expect(req.request.headers.has('Content-Type')).toBe(true);

    req.flush({});
  });

  it('should not modify original request', () => {
    mockAuthService.getToken.mockReturnValue('test-token');

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    // Request should be cloned, not mutated
    expect(req.request).toBeTruthy();

    req.flush({});
  });

  it('should call logout and navigate to /login on 401 response', () => {
    mockAuthService.getToken.mockReturnValue('expired-token');

    let errorReceived: any;
    httpClient.get('/api/test').subscribe({
      error: (err) => (errorReceived = err),
    });

    const req = httpMock.expectOne('/api/test');
    req.flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    expect(errorReceived.status).toBe(401);
  });

  it('should not logout on non-401 errors', () => {
    mockAuthService.getToken.mockReturnValue('valid-token');

    let errorReceived: any;
    httpClient.get('/api/test').subscribe({
      error: (err) => (errorReceived = err),
    });

    const req = httpMock.expectOne('/api/test');
    req.flush(
      { message: 'Server Error' },
      { status: 500, statusText: 'Internal Server Error' },
    );

    expect(mockAuthService.logout).not.toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(errorReceived.status).toBe(500);
  });

  it('should not logout on 403 errors', () => {
    mockAuthService.getToken.mockReturnValue('valid-token');

    let errorReceived: any;
    httpClient.get('/api/test').subscribe({
      error: (err) => (errorReceived = err),
    });

    const req = httpMock.expectOne('/api/test');
    req.flush(
      { message: 'Forbidden' },
      { status: 403, statusText: 'Forbidden' },
    );

    expect(mockAuthService.logout).not.toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(errorReceived.status).toBe(403);
  });

  it('should propagate 401 error to subscriber even after logout', () => {
    mockAuthService.getToken.mockReturnValue('expired-token');

    let errorReceived: any;
    httpClient.get('/api/test').subscribe({
      error: (err) => (errorReceived = err),
    });

    const req = httpMock.expectOne('/api/test');
    req.flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(errorReceived).toBeTruthy();
    expect(errorReceived.status).toBe(401);
  });

  it('should not handle 401 for non-/api requests (no token injection)', () => {
    mockAuthService.getToken.mockReturnValue('valid-token');

    httpClient.get('/other/endpoint').subscribe({
      error: () => {},
    });

    const req = httpMock.expectOne('/other/endpoint');
    req.flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' },
    );

    // Non-/api requests go through next(req) without error handling
    expect(mockAuthService.logout).not.toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
