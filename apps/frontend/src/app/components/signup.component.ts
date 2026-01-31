import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  styleUrl: './signup.component.sass',
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Créer un compte</h1>
        <p class="subtitle">Rejoignez FlexiCoach aujourd'hui</p>

        @if (errorMessage) {
          <div class="error-message">
            {{ errorMessage }}
          </div>
        }

        <button class="google-signin-btn" (click)="googleSignup()" type="button">
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          S'inscrire avec Google
        </button>

        <div class="divider"><span>ou</span></div>

        <form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="displayName">Nom (optionnel)</label>
            <input
              id="displayName"
              type="text"
              formControlName="displayName"
              placeholder="Votre nom"
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="votre@email.com"
              [class.invalid]="signupForm.get('email')?.invalid && signupForm.get('email')?.touched"
            />
            @if (signupForm.get('email')?.invalid && signupForm.get('email')?.touched) {
              <span class="field-error">Email invalide</span>
            }
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="••••••••"
              [class.invalid]="signupForm.get('password')?.invalid && signupForm.get('password')?.touched"
            />
            @if (signupForm.get('password')?.invalid && signupForm.get('password')?.touched) {
              <span class="field-error">Le mot de passe doit contenir au moins 6 caractères</span>
            }
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirmer le mot de passe</label>
            <input
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              placeholder="••••••••"
              [class.invalid]="signupForm.get('confirmPassword')?.invalid && signupForm.get('confirmPassword')?.touched"
            />
            @if (signupForm.hasError('passwordMismatch') && signupForm.get('confirmPassword')?.touched) {
              <span class="field-error">Les mots de passe ne correspondent pas</span>
            }
          </div>

          <button
            type="submit"
            class="submit-btn"
            [disabled]="signupForm.invalid || loading"
          >
            @if (loading) {
              <span>Création...</span>
            } @else {
              <span>Créer mon compte</span>
            }
          </button>
        </form>

        <p class="link-text">
          Déjà un compte ?
          <a routerLink="/login">Se connecter</a>
        </p>
      </div>
    </div>
  `,
})
export class SignupComponent {
  signupForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group(
      {
        displayName: [''],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.signupForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const { confirmPassword, ...registerData } = this.signupForm.value;

    this.authService.register(registerData).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error.error?.message || 'Erreur lors de la création du compte.';
      },
    });
  }

  googleSignup(): void {
    window.location.href = '/api/auth/google';
  }
}
