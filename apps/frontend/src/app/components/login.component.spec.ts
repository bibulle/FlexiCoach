import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideRouter } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockAuthService = {
      login: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([]),
      ],
    }).compileComponents();

    mockRouter = TestBed.inject(Router);
    vi.spyOn(mockRouter, 'navigate');

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.loginForm.value).toEqual({
      email: '',
      password: '',
    });
    expect(component.loading).toBe(false);
    expect(component.errorMessage).toBe('');
  });

  it('should validate email field as required', () => {
    const emailControl = component.loginForm.get('email');
    expect(emailControl?.valid).toBe(false);

    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBe(false);

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBe(true);
  });

  it('should validate password field as required', () => {
    const passwordControl = component.loginForm.get('password');
    expect(passwordControl?.valid).toBe(false);

    passwordControl?.setValue('password123');
    expect(passwordControl?.valid).toBe(true);
  });

  it('should have form invalid when fields are empty', () => {
    expect(component.loginForm.valid).toBe(false);
  });

  it('should have form valid when all fields are filled correctly', () => {
    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(component.loginForm.valid).toBe(true);
  });

  it('should call AuthService.login() on submit with valid form', () => {
    mockAuthService.login.mockReturnValue(of({}));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123',
    });

    component.onSubmit();

    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should navigate to / on successful login', () => {
    mockAuthService.login.mockReturnValue(of({}));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123',
    });

    component.onSubmit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should set loading to true during login', () => {
    mockAuthService.login.mockReturnValue(of({}));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123',
    });

    component.onSubmit();

    expect(component.loading).toBe(true);
  });

  it('should display error message on login failure', () => {
    const errorResponse = {
      error: { message: 'Invalid credentials' },
    };
    mockAuthService.login.mockReturnValue(throwError(() => errorResponse));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    component.onSubmit();

    expect(component.loading).toBe(false);
    expect(component.errorMessage).toBe('Invalid credentials');
  });

  it('should display default error message when error has no message', () => {
    mockAuthService.login.mockReturnValue(throwError(() => ({})));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    component.onSubmit();

    expect(component.errorMessage).toBe(
      'Erreur de connexion. Vérifiez vos identifiants.'
    );
  });

  it('should not submit if form is invalid', () => {
    component.loginForm.setValue({
      email: '',
      password: '',
    });

    component.onSubmit();

    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('should clear error message on new submit', () => {
    component.errorMessage = 'Previous error';
    mockAuthService.login.mockReturnValue(of({}));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123',
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('');
  });

  it('should display error in template when errorMessage is set', () => {
    component.errorMessage = 'Test error';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const errorElement = compiled.querySelector('.error-message');
    expect(errorElement?.textContent?.trim()).toBe('Test error');
  });

  it('should show email error when touched and invalid', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.markAsTouched();
    emailControl?.setValue('');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const errorElement = compiled.querySelector('.field-error');
    expect(errorElement?.textContent?.trim()).toBe('Email invalide');
  });

  it('should show password error when touched and invalid', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('test@example.com');

    const passwordControl = component.loginForm.get('password');
    passwordControl?.markAsTouched();
    passwordControl?.setValue('');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const errorElement = compiled.querySelector('.field-error');
    expect(errorElement?.textContent?.trim()).toBe('Mot de passe requis');
  });

  it('should disable submit button when form is invalid', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
  });

  it('should enable submit button when form is valid', () => {
    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123',
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(false);
  });

  it('should display "Connexion..." when loading', () => {
    component.loading = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector('button[type="submit"]');
    expect(submitButton?.textContent?.trim()).toBe('Connexion...');
  });

  it('should display "Se connecter" when not loading', () => {
    component.loading = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector('button[type="submit"]');
    expect(submitButton?.textContent?.trim()).toBe('Se connecter');
  });
});
