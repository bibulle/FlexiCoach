import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { SettingsService } from './settings.service';

export interface AuthResponse {
  access_token: string;
  user: {
    _id: string;
    email: string;
    displayName?: string;
    avatar?: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  private currentUserSubject = new BehaviorSubject<AuthResponse['user'] | null>(
    this.getUserFromStorage(),
  );
  public currentUser$ = this.currentUserSubject.asObservable();

  // Signal for reactive components
  public isAuthenticated = signal<boolean>(this.hasToken());
  public isAdmin = signal<boolean>(false);
  public isAdminMode = signal<boolean>(false);

  private settingsService = inject(SettingsService);

  constructor(private http: HttpClient) {
    // Admin status will be checked after DI resolution to avoid circular dependency
  }

  private getUserFromStorage(): AuthResponse['user'] | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }

  private hasToken(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  register(data: RegisterData): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/auth/register', data)
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/auth/login', credentials)
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
    this.isAdmin.set(false);
    this.isAdminMode.set(false);
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): AuthResponse['user'] | null {
    return this.currentUserSubject.value;
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.access_token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
    this.isAuthenticated.set(true);
    this.checkAdminStatus();
    // Sync settings from backend to localStorage right after login
    this.settingsService.load().subscribe();
  }

  toggleAdminMode(): void {
    this.isAdminMode.update((value) => !value);
  }

  checkAdminStatus(): void {
    this.http.get<{ isAdmin: boolean }>('/api/auth/is-admin').subscribe({
      next: (response) => this.isAdmin.set(response.isAdmin),
      error: () => this.isAdmin.set(false),
    });
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>('/api/admin/users');
  }

  resetUserPassword(userId: string, newPassword: string): Observable<any> {
    return this.http.patch(`/api/admin/users/${userId}/password`, {
      newPassword,
    });
  }

  exchangeOAuthCode(code: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/auth/exchange', { code })
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }
}
