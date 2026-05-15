import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  styleUrl: './signup.component.sass',
  template: `
    <div class="auth-shell">
      <!-- Desktop: split layout -->
      <div class="auth-desktop">
        <!-- Left brand panel -->
        <div class="auth-brand">
          <div class="brand-overlay"></div>
          <div class="brand-logo">
            <div class="brand-icon">F</div>
            FlexiCoach
          </div>
          <div class="brand-hero">
            <h2>Garde ton dos en mouvement.</h2>
            <p>
              Routines guidées de 5 à 15 minutes, séries quotidiennes, suivi
              visuel sur l'année. Construit sans kiné.
            </p>
            <div class="brand-stats">
              <div class="brand-stat">
                <span class="brand-stat-value">12 routines</span>
                <span class="brand-stat-label">curées</span>
              </div>
              <div class="brand-stat">
                <span class="brand-stat-value">Voix FR</span>
                <span class="brand-stat-label">guidée</span>
              </div>
              <div class="brand-stat">
                <span class="brand-stat-value">Hors-ligne</span>
                <span class="brand-stat-label">PWA</span>
              </div>
            </div>
          </div>
          <div class="brand-version">v1.0 · MVP</div>
        </div>

        <!-- Right form panel -->
        <div class="auth-form-panel">
          <div class="auth-form-wrapper">
            <h1 class="type-h1">Crée ton compte.</h1>
            <p class="type-body auth-subtitle">
              Trois minutes pour démarrer ta première routine.
            </p>

            @if (errorMessage) {
              <div class="auth-error error-message">{{ errorMessage }}</div>
            }

            <ng-container *ngTemplateOutlet="formContent"></ng-container>
          </div>
        </div>
      </div>

      <!-- Mobile: stacked layout -->
      <div class="auth-mobile">
        <div class="mobile-logo">
          <div class="mobile-icon">F</div>
          FlexiCoach
        </div>
        <h1 class="type-h1">Crée ton compte.</h1>
        <p class="type-body auth-subtitle">
          Trois minutes pour démarrer ta première routine.
        </p>

        @if (errorMessage) {
          <div class="auth-error error-message">{{ errorMessage }}</div>
        }

        <ng-container *ngTemplateOutlet="formContent"></ng-container>
      </div>
    </div>

    <ng-template #formContent>
      <!-- Google button -->
      <button
        class="btn btn-secondary btn-lg google-btn"
        (click)="googleSignup()"
        type="button"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M16.51 8.18c0-.59-.05-1.16-.15-1.71H8.85v3.24h4.29c-.18 1-.74 1.85-1.59 2.41v2h2.57c1.5-1.39 2.39-3.43 2.39-5.94z"
          />
          <path
            fill="#34A853"
            d="M8.85 16.5c2.16 0 3.97-.72 5.29-1.94l-2.57-2c-.71.48-1.62.76-2.72.76-2.09 0-3.87-1.41-4.5-3.31H1.7v2.07c1.32 2.62 4.04 4.42 7.15 4.42z"
          />
          <path
            fill="#FBBC04"
            d="M4.35 10.01c-.16-.48-.25-.99-.25-1.51s.09-1.03.25-1.51V4.92H1.7C1.16 5.99.85 7.21.85 8.5s.31 2.51.85 3.58l2.65-2.07z"
          />
          <path
            fill="#EA4335"
            d="M8.85 3.68c1.18 0 2.24.41 3.07 1.2l2.28-2.28C12.81 1.32 11 .5 8.85.5 5.74.5 3.02 2.3 1.7 4.92l2.65 2.07c.63-1.9 2.41-3.31 4.5-3.31z"
          />
        </svg>
        Continuer avec Google
      </button>

      <div class="auth-or">
        <span class="auth-or-line"></span>
        <span class="auth-or-text">OU</span>
        <span class="auth-or-line"></span>
      </div>

      <form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
        <div class="form-field">
          <label for="displayName">Prénom</label>
          <input
            id="displayName"
            class="input"
            type="text"
            formControlName="displayName"
            placeholder="Marc"
          />
        </div>

        <div class="form-field">
          <label for="email">Email</label>
          <input
            id="email"
            class="input"
            type="email"
            formControlName="email"
            placeholder="marc@exemple.fr"
            [class.input-invalid]="
              signupForm.get('email')?.invalid &&
              signupForm.get('email')?.touched
            "
          />
          @if (
            signupForm.get('email')?.invalid && signupForm.get('email')?.touched
          ) {
            <span class="field-error">Email invalide</span>
          }
        </div>

        <div class="form-field">
          <label for="password">Mot de passe</label>
          <input
            id="password"
            class="input"
            type="password"
            formControlName="password"
            placeholder="••••••••"
            [class.input-invalid]="
              signupForm.get('password')?.invalid &&
              signupForm.get('password')?.touched
            "
          />
          @if (
            signupForm.get('password')?.invalid &&
            signupForm.get('password')?.touched
          ) {
            <span class="field-error"
              >Le mot de passe doit contenir au moins 6 caractères</span
            >
          }
        </div>

        <div class="form-field">
          <label for="confirmPassword">Confirmer le mot de passe</label>
          <input
            id="confirmPassword"
            class="input"
            type="password"
            formControlName="confirmPassword"
            placeholder="••••••••"
            [class.input-invalid]="
              signupForm.get('confirmPassword')?.touched &&
              signupForm.hasError('passwordMismatch')
            "
          />
          @if (
            signupForm.hasError('passwordMismatch') &&
            signupForm.get('confirmPassword')?.touched
          ) {
            <span class="field-error"
              >Les mots de passe ne correspondent pas</span
            >
          }
        </div>

        <label class="cgu-label">
          <input type="checkbox" formControlName="acceptCgu" />
          <span
            >J'accepte les <a class="cgu-link" href="#">conditions</a> et la
            politique de confidentialité.</span
          >
        </label>

        <button
          type="submit"
          class="btn btn-primary btn-lg submit-btn"
          [disabled]="signupForm.invalid || loading"
        >
          @if (loading) {
            <span>Création...</span>
          } @else {
            <span>Créer mon compte</span>
          }
        </button>
      </form>

      <p class="auth-switch">
        Déjà un compte ?
        <a routerLink="/login">Connecte-toi</a>
      </p>
    </ng-template>
  `,
})
export class SignupComponent {
  signupForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.signupForm = this.fb.group(
      {
        displayName: [''],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        acceptCgu: [false, Validators.requiredTrue],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.signupForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const { confirmPassword, acceptCgu, ...registerData } =
      this.signupForm.value;

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
