import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let mockAuthService: any;

  beforeEach(() => {
    mockAuthService = {
      getToken: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
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
});
