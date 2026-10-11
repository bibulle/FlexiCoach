import { Injectable, Injector, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  BehaviorSubject,
  catchError,
  map,
  of,
  shareReplay,
  tap,
} from 'rxjs';

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
  private readonly ADMIN_MODE_KEY = 'admin_mode';

  private currentUserSubject = new BehaviorSubject<AuthResponse['user'] | null>(
    this.getUserFromStorage(),
  );
  public currentUser$ = this.currentUserSubject.asObservable();

  // Signal for reactive components
  public isAuthenticated = signal<boolean>(this.hasToken());
  public isAdmin = signal<boolean>(false);
  // Persisted in sessionStorage so that it survives a page reload
  public isAdminMode = signal<boolean>(this.getAdminModeFromStorage());

  // Shared result of GET /api/auth/is-admin for the current session
  private adminStatus$: Observable<boolean> | null = null;

  private injector = inject(Injector);

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

  private getAdminModeFromStorage(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      this.hasToken() && sessionStorage.getItem(this.ADMIN_MODE_KEY) === 'true'
    );
  }

  private setAdminMode(value: boolean): void {
    this.isAdminMode.set(value);
    if (typeof window === 'undefined') return;
    if (value) {
      sessionStorage.setItem(this.ADMIN_MODE_KEY, 'true');
    } else {
      sessionStorage.removeItem(this.ADMIN_MODE_KEY);
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
    this.adminStatus$ = null;
    this.setAdminMode(false);
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
    // A new session starts: forget the admin status of the previous one
    this.adminStatus$ = null;
    this.checkAdminStatus();
    // Sync settings from backend to localStorage right after login
    // Use injector to lazily resolve SettingsService and avoid circular dependency
    // (HttpClient → authInterceptor → AuthService → SettingsService → HttpClient)
    import('./settings.service').then((m) => {
      const settingsService = this.injector.get(m.SettingsService);
      settingsService.load().subscribe();
    });
  }

  toggleAdminMode(): void {
    this.setAdminMode(!this.isAdminMode());
  }

  checkAdminStatus(): void {
    this.resolveAdminStatus().subscribe();
  }

  /**
   * Emits whether the current user is an administrator, once the backend has
   * answered. The request is shared: guards and components that ask during
   * the same session get the same (cached) answer, and the `isAdmin` signal is
   * updated before the value is emitted. A failed request is not cached, so
   * the next call retries.
   */
  resolveAdminStatus(): Observable<boolean> {
    if (!this.adminStatus$) {
      const status$: Observable<boolean> = this.http
        .get<{ isAdmin: boolean }>('/api/auth/is-admin')
        .pipe(
          map((response) => response?.isAdmin === true),
          tap((isAdmin) => {
            this.isAdmin.set(isAdmin);
            // Admin mode is meaningless for a regular user
            if (!isAdmin) this.setAdminMode(false);
          }),
          catchError(() => {
            this.isAdmin.set(false);
            if (this.adminStatus$ === status$) this.adminStatus$ = null;
            return of(false);
          }),
          shareReplay(1),
        );
      this.adminStatus$ = status$;
    }

    return this.adminStatus$;
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
