import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideRouter } from '@angular/router';

describe('authGuard', () => {
  let mockAuthService: any;
  let router: Router;

  beforeEach(() => {
    mockAuthService = {
      isAuthenticated: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([]),
      ],
    });

    router = TestBed.inject(Router);
  });

  it('should allow activation when user is authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard(null as any, null as any));

    expect(result).toBe(true);
  });

  it('should redirect to /login when user is not authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => authGuard(null as any, null as any));

    expect(result).toBeTruthy();
    expect(result).not.toBe(true);
    // Result is a UrlTree, verify it points to /login
    const urlTree = result as any;
    expect(router.serializeUrl(urlTree)).toBe('/login');
  });

  it('should call isAuthenticated on AuthService', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);

    TestBed.runInInjectionContext(() => authGuard(null as any, null as any));

    expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
  });
});
