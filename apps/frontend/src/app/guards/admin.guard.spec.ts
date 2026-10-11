import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';
import { signal } from '@angular/core';
import { Observable, Subject, firstValueFrom, isObservable, of } from 'rxjs';

describe('adminGuard', () => {
  let mockAuthService: any;
  let mockRouter: any;

  const runGuard = () =>
    TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));

  /** The guard answers asynchronously once the user is authenticated. */
  const runGuardAsync = () => {
    const result = runGuard();
    expect(isObservable(result)).toBe(true);
    return firstValueFrom(result as Observable<unknown>);
  };

  beforeEach(() => {
    mockAuthService = {
      isAuthenticated: signal(true),
      // Still false on a direct access or a reload: the guard must not read it
      isAdmin: signal(false),
      resolveAdminStatus: vi.fn(() => of(true)),
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

  it('should allow activation when user is admin', async () => {
    expect(await runGuardAsync()).toBe(true);
    expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to /login when user is not authenticated', () => {
    mockAuthService.isAuthenticated.set(false);

    const result = runGuard();

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toBe('/login');
    // No need to ask the backend for an anonymous visitor
    expect(mockAuthService.resolveAdminStatus).not.toHaveBeenCalled();
  });

  it('should redirect to / when user is authenticated but not admin', async () => {
    mockAuthService.resolveAdminStatus.mockReturnValue(of(false));

    expect(await runGuardAsync()).toBe('/');
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/']);
  });

  it('should wait for the backend answer instead of reading the isAdmin signal (issue #149)', async () => {
    // Direct access to /admin or page reload: is-admin has not answered yet
    const adminStatus = new Subject<boolean>();
    mockAuthService.resolveAdminStatus.mockReturnValue(adminStatus);
    let settled = false;

    const pending = runGuardAsync().then((value) => {
      settled = true;
      return value;
    });

    await Promise.resolve();
    expect(settled).toBe(false);
    expect(mockRouter.createUrlTree).not.toHaveBeenCalled();

    adminStatus.next(true);
    adminStatus.complete();

    expect(await pending).toBe(true);
    expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to / when the admin check fails (resolved as non-admin)', async () => {
    // AuthService turns a failed request into `false`
    const adminStatus = new Subject<boolean>();
    mockAuthService.resolveAdminStatus.mockReturnValue(adminStatus);

    const pending = runGuardAsync();
    adminStatus.next(false);
    adminStatus.complete();

    expect(await pending).toBe('/');
  });
});
