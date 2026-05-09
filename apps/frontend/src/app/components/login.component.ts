import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  styleUrl: './login.component.sass',
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
            <p>Routines guidées de 5 à 15 minutes, séries quotidiennes, suivi visuel sur l'année. Construit avec un kiné.</p>
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
            <h1 class="type-h1">Bon retour.</h1>
            <p class="type-body auth-subtitle">Reprends ta série là où tu l'as laissée.</p>

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
        <h1 class="type-h1">Bon retour.</h1>
        <p class="type-body auth-subtitle">Reprends ta série là où tu l'as laissée.</p>

        @if (errorMessage) {
          <div class="auth-error error-message">{{ errorMessage }}</div>
        }

        <ng-container *ngTemplateOutlet="formContent"></ng-container>
      </div>
    </div>

    <ng-template #formContent>
      <!-- Google button -->
      <button class="btn btn-secondary btn-lg google-btn" (click)="googleLogin()" type="button">
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path fill="#4285F4" d="M16.51 8.18c0-.59-.05-1.16-.15-1.71H8.85v3.24h4.29c-.18 1-.74 1.85-1.59 2.41v2h2.57c1.5-1.39 2.39-3.43 2.39-5.94z"/>
          <path fill="#34A853" d="M8.85 16.5c2.16 0 3.97-.72 5.29-1.94l-2.57-2c-.71.48-1.62.76-2.72.76-2.09 0-3.87-1.41-4.5-3.31H1.7v2.07c1.32 2.62 4.04 4.42 7.15 4.42z"/>
          <path fill="#FBBC04" d="M4.35 10.01c-.16-.48-.25-.99-.25-1.51s.09-1.03.25-1.51V4.92H1.7C1.16 5.99.85 7.21.85 8.5s.31 2.51.85 3.58l2.65-2.07z"/>
          <path fill="#EA4335" d="M8.85 3.68c1.18 0 2.24.41 3.07 1.2l2.28-2.28C12.81 1.32 11 .5 8.85.5 5.74.5 3.02 2.3 1.7 4.92l2.65 2.07c.63-1.9 2.41-3.31 4.5-3.31z"/>
        </svg>
        Continuer avec Google
      </button>

      <div class="auth-or">
        <span class="auth-or-line"></span>
        <span class="auth-or-text">OU</span>
        <span class="auth-or-line"></span>
      </div>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="form-field">
          <label for="email">Email</label>
          <input
            id="email"
            class="input"
            type="email"
            formControlName="email"
            placeholder="marc@exemple.fr"
            [class.input-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
          />
          @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
            <span class="field-error">Email invalide</span>
          }
        </div>

        <div class="form-field">
          <div class="field-header">
            <label for="password">Mot de passe</label>
            <a class="forgot-link" href="#">Oublié ?</a>
          </div>
          <input
            id="password"
            class="input"
            type="password"
            formControlName="password"
            placeholder="••••••••"
            [class.input-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
          />
          @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
            <span class="field-error">Mot de passe requis</span>
          }
        </div>

        <button type="submit" class="btn btn-primary btn-lg submit-btn" [disabled]="loginForm.invalid || loading">
          @if (loading) { <span>Connexion...</span> } @else { <span>Se connecter</span> }
        </button>
      </form>

      <p class="auth-switch">
        Nouveau ici ?
        <a routerLink="/signup">Crée un compte</a>
      </p>
    </ng-template>
  `,
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error.error?.message || 'Erreur de connexion. Vérifiez vos identifiants.';
      },
    });
  }

  googleLogin(): void {
    window.location.href = '/api/auth/google';
  }
}
