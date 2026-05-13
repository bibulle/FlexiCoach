import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService, AuthResponse } from './auth.service';
import { firstValueFrom } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // Clear localStorage BEFORE creating the service
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('should make POST request and handle response', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'Password123',
        displayName: 'Test User',
      };

      const mockResponse: AuthResponse = {
        access_token: 'mock-token',
        user: {
          _id: '123',
          email: 'test@example.com',
          displayName: 'Test User',
        },
      };

      const responsePromise = firstValueFrom(service.register(registerData));

      const req = httpMock.expectOne('/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerData);
      req.flush(mockResponse);

      // handleAuthResponse() calls checkAdminStatus() which makes a GET request
      const adminReq = httpMock.expectOne('/api/auth/is-admin');
      adminReq.flush({ isAdmin: false });

      const response = await responsePromise;
      expect(response).toEqual(mockResponse);
      expect(localStorage.getItem('auth_token')).toBe('mock-token');
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('login', () => {
    it('should make POST request and handle response', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const mockResponse: AuthResponse = {
        access_token: 'mock-token',
        user: {
          _id: '123',
          email: 'test@example.com',
        },
      };

      const responsePromise = firstValueFrom(service.login(credentials));

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);

      // handleAuthResponse() calls checkAdminStatus() which makes a GET request
      const adminReq = httpMock.expectOne('/api/auth/is-admin');
      adminReq.flush({ isAdmin: false });

      const response = await responsePromise;
      expect(response).toEqual(mockResponse);
      expect(localStorage.getItem('auth_token')).toBe('mock-token');
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('isAdminMode', () => {
    it('should be false by default', () => {
      expect(service.isAdminMode()).toBe(false);
    });
  });

  describe('toggleAdminMode', () => {
    it('should toggle isAdminMode from false to true', () => {
      service.toggleAdminMode();
      expect(service.isAdminMode()).toBe(true);
    });

    it('should toggle isAdminMode back to false', () => {
      service.toggleAdminMode();
      service.toggleAdminMode();
      expect(service.isAdminMode()).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear localStorage and reset signals', () => {
      // Setup: simulate logged in state
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem(
        'current_user',
        JSON.stringify({ _id: '123', email: 'test@example.com' }),
      );

      service.logout();

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('current_user')).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(service.isAdmin()).toBe(false);
    });

    it('should reset isAdminMode to false', () => {
      service.toggleAdminMode();
      expect(service.isAdminMode()).toBe(true);

      service.logout();

      expect(service.isAdminMode()).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should retrieve token from localStorage', () => {
      localStorage.setItem('auth_token', 'test-token');

      expect(service.getToken()).toBe('test-token');
    });

    it('should return null when no token exists', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('checkAdminStatus', () => {
    it('should make GET request and update isAdmin signal', async () => {
      service.checkAdminStatus();

      await new Promise((resolve) => setTimeout(resolve, 10));

      const req = httpMock.expectOne('/api/auth/is-admin');
      expect(req.request.method).toBe('GET');
      req.flush({ isAdmin: true });

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(service.isAdmin()).toBe(true);
    });

    it('should set isAdmin to false on error', async () => {
      service.checkAdminStatus();

      await new Promise((resolve) => setTimeout(resolve, 10));

      const req = httpMock.expectOne('/api/auth/is-admin');
      req.error(new ProgressEvent('error'));

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('exchangeOAuthCode', () => {
    it('should make POST request to exchange endpoint and handle response', async () => {
      const mockResponse: AuthResponse = {
        access_token: 'oauth-token',
        user: {
          _id: '456',
          email: 'oauth@example.com',
          displayName: 'OAuth User',
          avatar: 'https://avatar.url',
        },
      };

      const responsePromise = firstValueFrom(
        service.exchangeOAuthCode('temp-code-123'),
      );

      const req = httpMock.expectOne('/api/auth/exchange');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ code: 'temp-code-123' });
      req.flush(mockResponse);

      // handleAuthResponse() calls checkAdminStatus() which makes a GET request
      const adminReq = httpMock.expectOne('/api/auth/is-admin');
      adminReq.flush({ isAdmin: false });

      const response = await responsePromise;
      expect(response).toEqual(mockResponse);
      expect(localStorage.getItem('auth_token')).toBe('oauth-token');
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('getAllUsers', () => {
    it('should call admin endpoint', async () => {
      const mockUsers = [
        { _id: '1', email: 'user1@example.com' },
        { _id: '2', email: 'user2@example.com' },
      ];

      const responsePromise = firstValueFrom(service.getAllUsers());

      const req = httpMock.expectOne('/api/admin/users');
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);

      const users = await responsePromise;
      expect(users).toEqual(mockUsers);
    });
  });

  describe('resetUserPassword', () => {
    it('should call admin endpoint with userId and new password', async () => {
      const userId = 'user123';
      const newPassword = 'NewPassword123';

      const responsePromise = firstValueFrom(
        service.resetUserPassword(userId, newPassword),
      );

      const req = httpMock.expectOne(`/api/admin/users/${userId}/password`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ newPassword });
      req.flush({});

      await responsePromise;
    });
  });
});
