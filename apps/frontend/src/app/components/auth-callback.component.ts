import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./auth-callback.component.css'],
  template: `
    <div class="callback-container">
      <div class="callback-content">
        @if (errorMessage) {
          <div class="error-message">
            <h2>Erreur d'authentification</h2>
            <p>{{ errorMessage }}</p>
            <button (click)="goToLogin()" class="btn-primary">
              Retour à la connexion
            </button>
          </div>
        } @else {
          <div class="loading-message">
            <div class="spinner"></div>
            <p>Connexion en cours...</p>
          </div>
        }
      </div>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const userJson = params['user'];
      const error = params['error'];

      if (error) {
        this.errorMessage = error;
        return;
      }

      if (token && userJson) {
        try {
          this.authService.handleOAuthCallback(token, userJson);
          this.router.navigate(['/']);
        } catch (err) {
          console.error('Error handling OAuth callback:', err);
          this.errorMessage = 'Une erreur est survenue lors de l\'authentification.';
        }
      } else {
        this.errorMessage = 'Paramètres d\'authentification manquants.';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
