import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

interface User {
  _id: string;
  email: string;
  displayName?: string;
}

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  styleUrl: './admin.component.sass',
  template: `
    <div class="admin-container">
      <div class="admin-card">
        <h1>Administration</h1>
        <p class="subtitle">Gestion des utilisateurs</p>

        @if (errorMessage) {
          <div class="error-message">{{ errorMessage }}</div>
        }

        @if (successMessage) {
          <div class="success-message">{{ successMessage }}</div>
        }

        @if (loading) {
          <p class="loading">Chargement...</p>
        } @else {
          <div class="users-list">
            @for (user of users; track user._id) {
              <div class="user-card">
                <div class="user-info">
                  <strong>{{ user.displayName || user.email }}</strong>
                  <span class="user-email">{{ user.email }}</span>
                </div>
                <button
                  class="reset-btn"
                  (click)="selectUser(user)"
                  [disabled]="resetting"
                >
                  Réinitialiser le mot de passe
                </button>
              </div>
            }
          </div>
        }

        @if (selectedUser) {
          <div class="modal-overlay" (click)="cancelReset()">
            <div class="modal" (click)="$event.stopPropagation()">
              <h2>Réinitialiser le mot de passe</h2>
              <p class="modal-user">
                Utilisateur :
                <strong>{{
                  selectedUser.displayName || selectedUser.email
                }}</strong>
              </p>

              <div class="form-group">
                <label for="newPassword">Nouveau mot de passe</label>
                <input
                  id="newPassword"
                  type="text"
                  [(ngModel)]="newPassword"
                  placeholder="Nouveau mot de passe"
                />
              </div>

              <div class="modal-actions">
                <button
                  class="cancel-btn"
                  (click)="cancelReset()"
                  [disabled]="resetting"
                >
                  Annuler
                </button>
                <button
                  class="confirm-btn"
                  (click)="confirmReset()"
                  [disabled]="!newPassword || resetting"
                >
                  @if (resetting) {
                    <span>Réinitialisation...</span>
                  } @else {
                    <span>Confirmer</span>
                  }
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class AdminComponent implements OnInit {
  users: User[] = [];
  loading = false;
  resetting = false;
  errorMessage = '';
  successMessage = '';
  selectedUser: User | null = null;
  newPassword = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error.error?.message || 'Erreur lors du chargement des utilisateurs';
      },
    });
  }

  selectUser(user: User): void {
    this.selectedUser = user;
    this.newPassword = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelReset(): void {
    this.selectedUser = null;
    this.newPassword = '';
  }

  confirmReset(): void {
    if (!this.selectedUser || !this.newPassword) return;

    this.resetting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService
      .resetUserPassword(this.selectedUser._id, this.newPassword)
      .subscribe({
        next: () => {
          this.resetting = false;
          this.successMessage = `Mot de passe réinitialisé pour ${this.selectedUser?.displayName || this.selectedUser?.email}`;
          this.selectedUser = null;
          this.newPassword = '';

          // Clear success message after 5 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
        },
        error: (error) => {
          this.resetting = false;
          this.errorMessage =
            error.error?.message ||
            'Erreur lors de la réinitialisation du mot de passe';
          this.selectedUser = null;
        },
      });
  }
}
