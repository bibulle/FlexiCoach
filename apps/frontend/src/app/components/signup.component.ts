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
}
