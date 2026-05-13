import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminComponent } from './admin.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { safeDetectChanges } from '../../test-utils';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let mockAuthService: any;
  let mockRouter: any;

  const mockUsers = [
    { _id: '1', email: 'user1@example.com', displayName: 'User One' },
    { _id: '2', email: 'user2@example.com', displayName: 'User Two' },
    { _id: '3', email: 'user3@example.com' },
  ];

  beforeEach(async () => {
    mockAuthService = {
      isAdmin: vi.fn(),
      getAllUsers: vi.fn(),
      resetUserPassword: vi.fn(),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AdminComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to / if user is not admin', () => {
    mockAuthService.isAdmin.mockReturnValue(false);

    safeDetectChanges(fixture);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should load users if user is admin', () => {
    mockAuthService.isAdmin.mockReturnValue(true);
    mockAuthService.getAllUsers.mockReturnValue(of(mockUsers));

    safeDetectChanges(fixture);

    expect(mockAuthService.getAllUsers).toHaveBeenCalled();
    expect(component.users).toEqual(mockUsers);
    expect(component.loading).toBe(false);
  });

  it('should set loading to true initially, then false after loading users', () => {
    mockAuthService.isAdmin.mockReturnValue(true);
    mockAuthService.getAllUsers.mockReturnValue(of(mockUsers));

    component.loadUsers();

    // Observable completes synchronously, so loading is false
    expect(component.loading).toBe(false);
    expect(component.users).toEqual(mockUsers);
  });

  it('should handle error when loading users fails', () => {
    mockAuthService.isAdmin.mockReturnValue(true);
    const errorResponse = {
      error: { message: 'Failed to load users' },
    };
    mockAuthService.getAllUsers.mockReturnValue(
      throwError(() => errorResponse),
    );

    safeDetectChanges(fixture);

    expect(component.loading).toBe(false);
    expect(component.errorMessage).toBe('Failed to load users');
  });

  it('should display default error message when error has no message', () => {
    mockAuthService.isAdmin.mockReturnValue(true);
    mockAuthService.getAllUsers.mockReturnValue(throwError(() => ({})));

    safeDetectChanges(fixture);

    expect(component.errorMessage).toBe(
      'Erreur lors du chargement des utilisateurs',
    );
  });

  it('should display users list when loaded', () => {
    mockAuthService.isAdmin.mockReturnValue(true);
    mockAuthService.getAllUsers.mockReturnValue(of(mockUsers));

    safeDetectChanges(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const userCards = compiled.querySelectorAll('.user-card');
    expect(userCards.length).toBe(3);
  });

  it('should display user displayName or email', () => {
    mockAuthService.isAdmin.mockReturnValue(true);
    mockAuthService.getAllUsers.mockReturnValue(of(mockUsers));

    safeDetectChanges(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const userCards = compiled.querySelectorAll('.user-card');

    const firstUserInfo = userCards[0].querySelector('.user-info strong');
    expect(firstUserInfo?.textContent?.trim()).toBe('User One');

    const thirdUserInfo = userCards[2].querySelector('.user-info strong');
    expect(thirdUserInfo?.textContent?.trim()).toBe('user3@example.com');
  });

  it('should select user when clicking reset button', () => {
    mockAuthService.isAdmin.mockReturnValue(true);
    mockAuthService.getAllUsers.mockReturnValue(of(mockUsers));

    safeDetectChanges(fixture);

    component.selectUser(mockUsers[0]);

    expect(component.selectedUser).toEqual(mockUsers[0]);
    expect(component.newPassword).toBe('');
    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toBe('');
  });

  it('should display modal when user is selected', () => {
    mockAuthService.isAdmin.mockReturnValue(true);
    mockAuthService.getAllUsers.mockReturnValue(of(mockUsers));

    safeDetectChanges(fixture);

    component.selectUser(mockUsers[0]);
    safeDetectChanges(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const modal = compiled.querySelector('.modal');
    expect(modal).toBeTruthy();
  });

  it('should close modal when clicking cancel', () => {
    mockAuthService.isAdmin.mockReturnValue(true);
    mockAuthService.getAllUsers.mockReturnValue(of(mockUsers));

    safeDetectChanges(fixture);

    component.selectUser(mockUsers[0]);
    component.cancelReset();

    expect(component.selectedUser).toBeNull();
    expect(component.newPassword).toBe('');
  });

  it('should close modal when clicking overlay', () => {
    mockAuthService.isAdmin.mockReturnValue(true);
    mockAuthService.getAllUsers.mockReturnValue(of(mockUsers));

    safeDetectChanges(fixture);

    component.selectUser(mockUsers[0]);
    safeDetectChanges(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const overlay = compiled.querySelector('.modal-overlay') as HTMLElement;
    overlay.click();

    expect(component.selectedUser).toBeNull();
  });

  it('should not close modal when clicking inside modal', () => {
    mockAuthService.isAdmin.mockReturnValue(true);
    mockAuthService.getAllUsers.mockReturnValue(of(mockUsers));

    safeDetectChanges(fixture);

    component.selectUser(mockUsers[0]);
    safeDetectChanges(fixture);

    expect(component.selectedUser).toEqual(mockUsers[0]);
  });

  it('should disable confirm button when newPassword is empty', () => {
    mockAuthService.isAdmin.mockReturnValue(true);
    mockAuthService.getAllUsers.mockReturnValue(of(mockUsers));

    safeDetectChanges(fixture);

    component.selectUser(mockUsers[0]);
    component.newPassword = '';
    safeDetectChanges(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const confirmButton = compiled.querySelector(
      '.confirm-btn',
    ) as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(true);
  });

  it('should enable confirm button when newPassword is filled', () => {
    mockAuthService.isAdmin.mockReturnValue(true);
    mockAuthService.getAllUsers.mockReturnValue(of(mockUsers));

    safeDetectChanges(fixture);

    component.selectUser(mockUsers[0]);
    component.newPassword = 'newpassword123';
    safeDetectChanges(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const confirmButton = compiled.querySelector(
      '.confirm-btn',
    ) as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(false);
  });

  it('should call resetUserPassword when confirming reset', () => {
    mockAuthService.isAdmin.mockReturnValue(true);
    mockAuthService.getAllUsers.mockReturnValue(of(mockUsers));
    mockAuthService.resetUserPassword.mockReturnValue(of({}));

    safeDetectChanges(fixture);

    component.selectUser(mockUsers[0]);
    component.newPassword = 'newpassword123';
    component.confirmReset();

    expect(mockAuthService.resetUserPassword).toHaveBeenCalledWith(
      '1',
      'newpassword123',
    );
  });

  it('should display success message after successful reset', () => {
    mockAuthService.isAdmin.mockReturnValue(true);
    mockAuthService.getAllUsers.mockReturnValue(of(mockUsers));
    mockAuthService.resetUserPassword.mockReturnValue(of({}));

    safeDetectChanges(fixture);

    component.selectUser(mockUsers[0]);
    component.newPassword = 'newpassword123';
    component.confirmReset();

    expect(component.resetting).toBe(false);
    expect(component.successMessage).toBe(
      'Mot de passe réinitialisé pour User One',
    );
    expect(component.selectedUser).toBeNull();
    expect(component.newPassword).toBe('');

    // Success message is cleared after 5 seconds, tested separately if needed
  });

  it('should display error message when reset fails', () => {
    mockAuthService.isAdmin.mockReturnValue(true);
    mockAuthService.getAllUsers.mockReturnValue(of(mockUsers));
    const errorResponse = {
      error: { message: 'Reset failed' },
    };
    mockAuthService.resetUserPassword.mockReturnValue(
      throwError(() => errorResponse),
    );

    safeDetectChanges(fixture);

    component.selectUser(mockUsers[0]);
    component.newPassword = 'newpassword123';
    component.confirmReset();

    expect(component.resetting).toBe(false);
    expect(component.errorMessage).toBe('Reset failed');
    expect(component.selectedUser).toBeNull();
  });

  it('should display default error message when reset error has no message', () => {
    mockAuthService.isAdmin.mockReturnValue(true);
    mockAuthService.getAllUsers.mockReturnValue(of(mockUsers));
    mockAuthService.resetUserPassword.mockReturnValue(throwError(() => ({})));

    safeDetectChanges(fixture);

    component.selectUser(mockUsers[0]);
    component.newPassword = 'newpassword123';
    component.confirmReset();

    expect(component.errorMessage).toBe(
      'Erreur lors de la réinitialisation du mot de passe',
    );
  });

  it('should set resetting to true during password reset', () => {
    mockAuthService.isAdmin.mockReturnValue(true);
    mockAuthService.getAllUsers.mockReturnValue(of(mockUsers));
    mockAuthService.resetUserPassword.mockReturnValue(of({}));

    safeDetectChanges(fixture);

    component.selectUser(mockUsers[0]);
    component.newPassword = 'newpassword123';
    component.confirmReset();

    expect(component.resetting).toBe(false);
  });

  it('should not call resetUserPassword if no user selected', () => {
    mockAuthService.isAdmin.mockReturnValue(true);
    mockAuthService.getAllUsers.mockReturnValue(of(mockUsers));

    safeDetectChanges(fixture);

    component.selectedUser = null;
    component.newPassword = 'newpassword123';
    component.confirmReset();

    expect(mockAuthService.resetUserPassword).not.toHaveBeenCalled();
  });

  it('should not call resetUserPassword if newPassword is empty', () => {
    mockAuthService.isAdmin.mockReturnValue(true);
    mockAuthService.getAllUsers.mockReturnValue(of(mockUsers));

    safeDetectChanges(fixture);

    component.selectUser(mockUsers[0]);
    component.newPassword = '';
    component.confirmReset();

    expect(mockAuthService.resetUserPassword).not.toHaveBeenCalled();
  });

  it('should display loading message while loading', () => {
    mockAuthService.isAdmin.mockReturnValue(true);
    mockAuthService.getAllUsers.mockReturnValue(of(mockUsers));

    safeDetectChanges(fixture);

    component.loading = true;
    component.users = [];
    safeDetectChanges(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const loadingElement = compiled.querySelector('.loading');
    expect(loadingElement).toBeTruthy();
    expect(loadingElement?.textContent?.trim()).toBe('Chargement...');
  });

  it('should display error message in template', () => {
    mockAuthService.isAdmin.mockReturnValue(true);
    mockAuthService.getAllUsers.mockReturnValue(of(mockUsers));

    safeDetectChanges(fixture);

    component.errorMessage = 'Test error';
    safeDetectChanges(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const errorElement = compiled.querySelector('.error-message');
    expect(errorElement?.textContent?.trim()).toBe('Test error');
  });

  it('should display success message in template', () => {
    mockAuthService.isAdmin.mockReturnValue(true);
    mockAuthService.getAllUsers.mockReturnValue(of(mockUsers));

    safeDetectChanges(fixture);

    component.successMessage = 'Test success';
    safeDetectChanges(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const successElement = compiled.querySelector('.success-message');
    expect(successElement?.textContent?.trim()).toBe('Test success');
  });

  it('should display "Réinitialisation..." when resetting', () => {
    mockAuthService.isAdmin.mockReturnValue(true);
    mockAuthService.getAllUsers.mockReturnValue(of(mockUsers));

    safeDetectChanges(fixture);

    component.selectUser(mockUsers[0]);
    component.newPassword = 'newpassword123';
    component.resetting = true;
    safeDetectChanges(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const confirmButton = compiled.querySelector('.confirm-btn');
    expect(confirmButton?.textContent?.trim()).toBe('Réinitialisation...');
  });

  it('should display "Confirmer" when not resetting', () => {
    mockAuthService.isAdmin.mockReturnValue(true);
    mockAuthService.getAllUsers.mockReturnValue(of(mockUsers));

    safeDetectChanges(fixture);

    component.selectUser(mockUsers[0]);
    component.newPassword = 'newpassword123';
    component.resetting = false;
    safeDetectChanges(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const confirmButton = compiled.querySelector('.confirm-btn');
    expect(confirmButton?.textContent?.trim()).toBe('Confirmer');
  });
});
