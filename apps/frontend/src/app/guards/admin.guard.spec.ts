import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';
import { signal } from '@angular/core';

describe('adminGuard', () => {
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(() => {
    mockAuthService = {
      isAuthenticated: signal(true),
      isAdmin: signal(true),
    };

    mockRouter = {
      createUrlTree: vi.fn((commands: string[]) => commands.join('/') as any),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  it('should allow activation when user is admin', () => {
    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect(result).toBe(true);
  });

  it('should redirect to /login when user is not authenticated', () => {
    mockAuthService.isAuthenticated.set(false);
    TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('should redirect to / when user is authenticated but not admin', () => {
    mockAuthService.isAdmin.set(false);
    TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/']);
  });
});
