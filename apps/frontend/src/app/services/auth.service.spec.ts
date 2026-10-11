import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService, AuthResponse } from './auth.service';
import { SettingsService } from './settings.service';
import { firstValueFrom, of } from 'rxjs';
import { vi } from 'vitest';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockSettingsService: any;

  beforeEach(() => {
    // Clear storages BEFORE creating the service
    localStorage.clear();
    sessionStorage.clear();

    mockSettingsService = {
      load: vi.fn().mockReturnValue(of(null)),
      save: vi.fn().mockReturnValue(of(null)),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: SettingsService, useValue: mockSettingsService },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    sessionStorage.clear();
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

  describe('settings sync after login', () => {
    it('should call settingsService.load() after login', async () => {
      const mockResponse: AuthResponse = {
        access_token: 'mock-token',
        user: { _id: '123', email: 'test@example.com' },
      };

      const responsePromise = firstValueFrom(
        service.login({ email: 'test@example.com', password: 'pass' }),
      );

      const req = httpMock.expectOne('/api/auth/login');
      req.flush(mockResponse);

      const adminReq = httpMock.expectOne('/api/auth/is-admin');
      adminReq.flush({ isAdmin: false });

      await responsePromise;
      // Wait for dynamic import to resolve
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(mockSettingsService.load).toHaveBeenCalled();
    });

    it('should call settingsService.load() after OAuth exchange', async () => {
      const mockResponse: AuthResponse = {
        access_token: 'oauth-token',
        user: { _id: '456', email: 'oauth@example.com' },
      };

      const responsePromise = firstValueFrom(
        service.exchangeOAuthCode('code-123'),
      );

      const req = httpMock.expectOne('/api/auth/exchange');
      req.flush(mockResponse);

      const adminReq = httpMock.expectOne('/api/auth/is-admin');
      adminReq.flush({ isAdmin: false });

      await responsePromise;
      // Wait for dynamic import to resolve
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(mockSettingsService.load).toHaveBeenCalled();
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

  describe('admin mode persistence (issue #149)', () => {
    /** Builds a fresh service, as a page reload would. */
    const reloadService = () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          AuthService,
          { provide: SettingsService, useValue: mockSettingsService },
        ],
      });
      service = TestBed.inject(AuthService);
      httpMock = TestBed.inject(HttpTestingController);
      return service;
    };

    it('should store the admin mode in sessionStorage when switched on', () => {
      service.toggleAdminMode();

      expect(sessionStorage.getItem('admin_mode')).toBe('true');
    });

    it('should remove the admin mode from sessionStorage when switched off', () => {
      service.toggleAdminMode();
      service.toggleAdminMode();

      expect(sessionStorage.getItem('admin_mode')).toBeNull();
    });

    it('should restore the admin mode after a reload of an authenticated session', () => {
      localStorage.setItem('auth_token', 'test-token');
      sessionStorage.setItem('admin_mode', 'true');

      expect(reloadService().isAdminMode()).toBe(true);
    });

    it('should not restore the admin mode without a token', () => {
      sessionStorage.setItem('admin_mode', 'true');

      expect(reloadService().isAdminMode()).toBe(false);
    });

    it('should ignore an unexpected stored value', () => {
      localStorage.setItem('auth_token', 'test-token');
      sessionStorage.setItem('admin_mode', 'yes');

      expect(reloadService().isAdminMode()).toBe(false);
    });

    it('should clear the stored admin mode on logout', () => {
      service.toggleAdminMode();

      service.logout();

      expect(service.isAdminMode()).toBe(false);
      expect(sessionStorage.getItem('admin_mode')).toBeNull();
    });

    it('should switch the admin mode off when the backend says the user is not admin', async () => {
      service.toggleAdminMode();

      const status = firstValueFrom(service.resolveAdminStatus());
      httpMock.expectOne('/api/auth/is-admin').flush({ isAdmin: false });

      expect(await status).toBe(false);
      expect(service.isAdminMode()).toBe(false);
      expect(sessionStorage.getItem('admin_mode')).toBeNull();
    });

    it('should keep the admin mode when the backend confirms the admin', async () => {
      service.toggleAdminMode();

      const status = firstValueFrom(service.resolveAdminStatus());
      httpMock.expectOne('/api/auth/is-admin').flush({ isAdmin: true });

      expect(await status).toBe(true);
      expect(service.isAdminMode()).toBe(true);
    });

    it('should keep the admin mode when the admin check fails (network error)', async () => {
      service.toggleAdminMode();

      const status = firstValueFrom(service.resolveAdminStatus());
      httpMock
        .expectOne('/api/auth/is-admin')
        .error(new ProgressEvent('error'));

      expect(await status).toBe(false);
      expect(service.isAdminMode()).toBe(true);
    });
  });

  describe('resolveAdminStatus (issue #149)', () => {
    it('should emit true and update the isAdmin signal for an admin', async () => {
      const status = firstValueFrom(service.resolveAdminStatus());

      const req = httpMock.expectOne('/api/auth/is-admin');
      expect(req.request.method).toBe('GET');
      // Nothing is known before the backend answers
      expect(service.isAdmin()).toBe(false);
      req.flush({ isAdmin: true });

      expect(await status).toBe(true);
      expect(service.isAdmin()).toBe(true);
    });

    it('should emit false for a regular user', async () => {
      const status = firstValueFrom(service.resolveAdminStatus());
      httpMock.expectOne('/api/auth/is-admin').flush({ isAdmin: false });

      expect(await status).toBe(false);
      expect(service.isAdmin()).toBe(false);
    });

    it.each([{}, null, { isAdmin: 'true' }])(
      'should emit false for the unexpected response %j',
      async (body) => {
        const status = firstValueFrom(service.resolveAdminStatus());
        httpMock.expectOne('/api/auth/is-admin').flush(body as any);

        expect(await status).toBe(false);
        expect(service.isAdmin()).toBe(false);
      },
    );

    it('should emit false (without throwing) when the request fails', async () => {
      const status = firstValueFrom(service.resolveAdminStatus());
      httpMock
        .expectOne('/api/auth/is-admin')
        .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(await status).toBe(false);
      expect(service.isAdmin()).toBe(false);
    });

    it('should share a single request between concurrent callers', async () => {
      // AppComponent and the admin guard both ask at startup
      service.checkAdminStatus();
      const fromGuard = firstValueFrom(service.resolveAdminStatus());

      httpMock.expectOne('/api/auth/is-admin').flush({ isAdmin: true });

      expect(await fromGuard).toBe(true);
    });

    it('should reuse the cached answer for later callers', async () => {
      const first = firstValueFrom(service.resolveAdminStatus());
      httpMock.expectOne('/api/auth/is-admin').flush({ isAdmin: true });
      await first;

      expect(await firstValueFrom(service.resolveAdminStatus())).toBe(true);
      httpMock.expectNone('/api/auth/is-admin');
    });

    it('should retry after a failed request instead of caching the failure', async () => {
      const first = firstValueFrom(service.resolveAdminStatus());
      httpMock
        .expectOne('/api/auth/is-admin')
        .error(new ProgressEvent('error'));
      expect(await first).toBe(false);

      const second = firstValueFrom(service.resolveAdminStatus());
      httpMock.expectOne('/api/auth/is-admin').flush({ isAdmin: true });

      expect(await second).toBe(true);
      expect(service.isAdmin()).toBe(true);
    });

    it('should ask the backend again after logout', async () => {
      const first = firstValueFrom(service.resolveAdminStatus());
      httpMock.expectOne('/api/auth/is-admin').flush({ isAdmin: true });
      await first;

      service.logout();
      expect(service.isAdmin()).toBe(false);

      const second = firstValueFrom(service.resolveAdminStatus());
      httpMock.expectOne('/api/auth/is-admin').flush({ isAdmin: false });
      expect(await second).toBe(false);
    });

    it('should ask the backend again after a new login', async () => {
      const first = firstValueFrom(service.resolveAdminStatus());
      httpMock.expectOne('/api/auth/is-admin').flush({ isAdmin: false });
      await first;

      const login = firstValueFrom(
        service.login({ email: 'admin@example.com', password: 'Password123' }),
      );
      httpMock.expectOne('/api/auth/login').flush({
        access_token: 'admin-token',
        user: { _id: '1', email: 'admin@example.com' },
      });
      await login;
      httpMock.expectOne('/api/auth/is-admin').flush({ isAdmin: true });

      expect(service.isAdmin()).toBe(true);
      expect(await firstValueFrom(service.resolveAdminStatus())).toBe(true);
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

  describe('getUserFromStorage (corrupted localStorage)', () => {
    it('should return null and clean up when localStorage contains invalid JSON', () => {
      localStorage.setItem('current_user', '{corrupted-json');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [AuthService],
      });

      const freshService = TestBed.inject(AuthService);

      expect(freshService.getCurrentUser()).toBeNull();
      expect(localStorage.getItem('current_user')).toBeNull();
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
