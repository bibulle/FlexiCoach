import {
  Component,
  signal,
  computed,
  inject,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
})
export class UserMenuComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  isMenuOpen = signal(false);
  currentUser = computed(() => {
    // Subscribe to currentUser$ observable to get the latest value
    let user: any = null;
    this.authService.currentUser$.subscribe((u) => (user = u)).unsubscribe();
    return user;
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.user-menu');

    if (!clickedInside && this.isMenuOpen()) {
      this.isMenuOpen.set(false);
    }
  }

  toggleMenu(): void {
    this.isMenuOpen.update((value) => !value);
  }

  getInitials(): string {
    const user = this.currentUser();
    if (!user) return '';

    if (user.displayName) {
      const names = user.displayName.trim().split(' ');
      if (names.length >= 2) {
        return names[0][0] + names[1][0];
      }
      return user.displayName.substring(0, 2);
    }

    if (user.email) {
      return user.email.substring(0, 2);
    }

    return 'U';
  }

  getDisplayName(): string {
    const user = this.currentUser();
    if (!user) return '';

    if (user.displayName) {
      return user.displayName;
    }

    if (user.email) {
      const emailPrefix = user.email.split('@')[0];
      return emailPrefix;
    }

    return 'Utilisateur';
  }

  toggleAdminMode(): void {
    this.authService.toggleAdminMode();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.isMenuOpen.set(false);
  }
}
