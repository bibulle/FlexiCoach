import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthCallbackComponent } from './auth-callback.component';
import { AuthService } from '../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, vi } from 'vitest';
import { safeDetectChanges } from '../../test-utils';

function setup(queryParams: any, authOverrides: any = {}) {
  const authService = {
    exchangeOAuthCode: vi.fn(),
    ...authOverrides,
  };
  const router = { navigate: vi.fn() };

  TestBed.configureTestingModule({
    imports: [AuthCallbackComponent],
    providers: [
      { provide: AuthService, useValue: authService },
      { provide: Router, useValue: router },
      {
        provide: ActivatedRoute,
        useValue: { queryParams: of(queryParams) },
      },
    ],
  });

  const fixture = TestBed.createComponent(AuthCallbackComponent);
  const component = fixture.componentInstance;
  safeDetectChanges(fixture);

  return { component, fixture, authService, router };
}

describe('AuthCallbackComponent', () => {
  it('should create', () => {
    const { component } = setup({});
    expect(component).toBeTruthy();
  });

  it('should exchange code and navigate to home on success', () => {
    const mockResponse = {
      access_token: 'token',
      user: { _id: '1', email: 'a@b.com' },
    };
    const { authService, router } = setup(
      { code: 'auth-code-123' },
      { exchangeOAuthCode: vi.fn().mockReturnValue(of(mockResponse)) },
    );

    expect(authService.exchangeOAuthCode).toHaveBeenCalledWith('auth-code-123');
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should set error message on exchange failure', () => {
    const { component } = setup(
      { code: 'bad-code' },
      {
        exchangeOAuthCode: vi
          .fn()
          .mockReturnValue(throwError(() => new Error('Exchange failed'))),
      },
    );

    expect(component.errorMessage).toBe(
      "Une erreur est survenue lors de l'authentification.",
    );
  });

  it('should set error message when error param is present', () => {
    const { component, authService } = setup({ error: 'access_denied' });

    expect(component.errorMessage).toBe('access_denied');
    expect(authService.exchangeOAuthCode).not.toHaveBeenCalled();
  });

  it('should set error message when no code or error param', () => {
    const { component, authService } = setup({});

    expect(component.errorMessage).toBe(
      "Paramètres d'authentification manquants.",
    );
    expect(authService.exchangeOAuthCode).not.toHaveBeenCalled();
  });

  it('should navigate to login on goToLogin', () => {
    const { component, router } = setup({});
    component.goToLogin();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
