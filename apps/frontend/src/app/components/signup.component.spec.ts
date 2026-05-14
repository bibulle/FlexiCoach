import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { safeDetectChanges } from '../../test-utils';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockAuthService = {
      register: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SignupComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([]),
      ],
    }).compileComponents();

    mockRouter = TestBed.inject(Router);
    vi.spyOn(mockRouter, 'navigate');

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    safeDetectChanges(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.signupForm.value).toEqual({
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptCgu: false,
    });
    expect(component.loading).toBe(false);
    expect(component.errorMessage).toBe('');
  });

  it('should validate email field as required', () => {
    const emailControl = component.signupForm.get('email');
    expect(emailControl?.valid).toBe(false);

    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBe(false);

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBe(true);
  });

  it('should validate password field as required with min length 6', () => {
    const passwordControl = component.signupForm.get('password');
    expect(passwordControl?.valid).toBe(false);

    passwordControl?.setValue('12345');
    expect(passwordControl?.valid).toBe(false);

    passwordControl?.setValue('123456');
    expect(passwordControl?.valid).toBe(true);
  });

  it('should validate confirmPassword field as required', () => {
    const confirmPasswordControl = component.signupForm.get('confirmPassword');
    expect(confirmPasswordControl?.valid).toBe(false);

    confirmPasswordControl?.setValue('password123');
    expect(confirmPasswordControl?.valid).toBe(true);
  });

  it('should have form invalid when fields are empty', () => {
    expect(component.signupForm.valid).toBe(false);
  });

  it('should validate password match', () => {
    component.signupForm.patchValue({
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'different123',
    });

    expect(component.signupForm.hasError('passwordMismatch')).toBe(true);
    expect(component.signupForm.valid).toBe(false);
  });

  it('should have form valid when passwords match', () => {
    component.signupForm.patchValue({
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      acceptCgu: true,
    });

    expect(component.signupForm.hasError('passwordMismatch')).toBe(false);
    expect(component.signupForm.valid).toBe(true);
  });

  it('should allow displayName to be optional', () => {
    component.signupForm.patchValue({
      displayName: '',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      acceptCgu: true,
    });

    expect(component.signupForm.valid).toBe(true);
  });

  it('should call AuthService.register() on submit with valid form', () => {
    mockAuthService.register.mockReturnValue(of({}));

    component.signupForm.setValue({
      displayName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      acceptCgu: true,
    });

    component.onSubmit();

    expect(mockAuthService.register).toHaveBeenCalledWith({
      displayName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should exclude confirmPassword from register call', () => {
    mockAuthService.register.mockReturnValue(of({}));

    component.signupForm.setValue({
      displayName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      acceptCgu: true,
    });

    component.onSubmit();

    const registerCall = mockAuthService.register.mock.calls[0][0];
    expect(registerCall).not.toHaveProperty('confirmPassword');
  });

  it('should navigate to / on successful registration', () => {
    mockAuthService.register.mockReturnValue(of({}));

    component.signupForm.setValue({
      displayName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      acceptCgu: true,
    });

    component.onSubmit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should set loading to true during registration', () => {
    mockAuthService.register.mockReturnValue(of({}));

    component.signupForm.setValue({
      displayName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      acceptCgu: true,
    });

    component.onSubmit();

    expect(component.loading).toBe(true);
  });

  it('should display error message on registration failure', () => {
    const errorResponse = {
      error: { message: 'Email already exists' },
    };
    mockAuthService.register.mockReturnValue(throwError(() => errorResponse));

    component.signupForm.setValue({
      displayName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      acceptCgu: true,
    });

    component.onSubmit();

    expect(component.loading).toBe(false);
    expect(component.errorMessage).toBe('Email already exists');
  });

  it('should display default error message when error has no message', () => {
    mockAuthService.register.mockReturnValue(throwError(() => ({})));

    component.signupForm.setValue({
      displayName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      acceptCgu: true,
    });

    component.onSubmit();

    expect(component.errorMessage).toBe(
      'Erreur lors de la création du compte.',
    );
  });

  it('should not submit if form is invalid', () => {
    component.signupForm.setValue({
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptCgu: false,
    });

    component.onSubmit();

    expect(mockAuthService.register).not.toHaveBeenCalled();
  });

  it('should clear error message on new submit', () => {
    component.errorMessage = 'Previous error';
    mockAuthService.register.mockReturnValue(of({}));

    component.signupForm.setValue({
      displayName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      acceptCgu: true,
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('');
  });

  it('should display error in template when errorMessage is set', () => {
    component.errorMessage = 'Test error';
    safeDetectChanges(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const errorElement = compiled.querySelector('.error-message');
    expect(errorElement?.textContent?.trim()).toBe('Test error');
  });

  it('should show email error when touched and invalid', () => {
    const emailControl = component.signupForm.get('email');
    emailControl?.markAsTouched();
    emailControl?.setValue('');
    safeDetectChanges(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const errorElements = compiled.querySelectorAll('.field-error');
    const errorTexts = Array.from(errorElements).map((el) =>
      el.textContent?.trim(),
    );
    expect(errorTexts).toContain('Email invalide');
  });

  it('should show password error when touched and invalid', () => {
    const passwordControl = component.signupForm.get('password');
    passwordControl?.markAsTouched();
    passwordControl?.setValue('123');
    safeDetectChanges(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const errorElements = compiled.querySelectorAll('.field-error');
    const errorTexts = Array.from(errorElements).map((el) =>
      el.textContent?.trim(),
    );
    expect(errorTexts).toContain(
      'Le mot de passe doit contenir au moins 6 caractères',
    );
  });

  it('should show password mismatch error when passwords do not match', () => {
    component.signupForm.patchValue({
      password: 'password123',
      confirmPassword: 'different123',
    });
    const confirmPasswordControl = component.signupForm.get('confirmPassword');
    confirmPasswordControl?.markAsTouched();
    safeDetectChanges(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const errorElements = compiled.querySelectorAll('.field-error');
    const errorTexts = Array.from(errorElements).map((el) =>
      el.textContent?.trim(),
    );
    expect(errorTexts).toContain('Les mots de passe ne correspondent pas');
  });

  it('should disable submit button when form is invalid', () => {
    safeDetectChanges(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
  });

  it('should enable submit button when form is valid', () => {
    component.signupForm.setValue({
      displayName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      acceptCgu: true,
    });
    safeDetectChanges(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(false);
  });

  it('should display "Création..." when loading', () => {
    component.loading = true;
    safeDetectChanges(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector('button[type="submit"]');
    expect(submitButton?.textContent?.trim()).toBe('Création...');
  });

  it('should display "Créer mon compte" when not loading', () => {
    component.loading = false;
    safeDetectChanges(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector('button[type="submit"]');
    expect(submitButton?.textContent?.trim()).toBe('Créer mon compte');
  });
});
