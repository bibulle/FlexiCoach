import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { UserMenuComponent } from './user-menu.component';
import { AuthService } from '../services/auth.service';

describe('UserMenuComponent', () => {
  let component: UserMenuComponent;
  let fixture: ComponentFixture<UserMenuComponent>;
  let mockAuthService: any;
  let mockRouter: Router;
  let currentUserSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    currentUserSubject = new BehaviorSubject<any>(null);

    mockAuthService = {
      currentUser$: currentUserSubject.asObservable(),
      logout: vi.fn(),
      isAdmin: signal(false),
      isAdminMode: signal(false),
      toggleAdminMode: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [UserMenuComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserMenuComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router);
    vi.spyOn(mockRouter, 'navigate');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not display menu when no user is logged in', () => {
    currentUserSubject.next(null);
    fixture.detectChanges();

    const userMenu = fixture.nativeElement.querySelector('.user-menu-trigger');
    expect(userMenu).toBeNull();
  });

  it('should display displayName when user has displayName', () => {
    const user = { _id: '1', email: 'test@example.com', displayName: 'John Doe' };
    currentUserSubject.next(user);
    fixture.detectChanges();

    const userName = fixture.nativeElement.querySelector('.user-name');
    expect(userName.textContent).toBe('John Doe');
  });

  it('should display email prefix when user has no displayName', () => {
    const user = { _id: '1', email: 'testuser@example.com' };
    currentUserSubject.next(user);
    fixture.detectChanges();

    const userName = fixture.nativeElement.querySelector('.user-name');
    expect(userName.textContent).toBe('testuser');
  });

  it('should calculate initials correctly from displayName', () => {
    const user = { _id: '1', email: 'test@example.com', displayName: 'John Doe' };
    currentUserSubject.next(user);
    fixture.detectChanges();

    expect(component.getInitials()).toBe('JD');

    const avatar = fixture.nativeElement.querySelector('.user-avatar');
    expect(avatar.textContent.trim()).toBe('JD');
  });

  it('should calculate initials from single name', () => {
    const user = { _id: '1', email: 'test@example.com', displayName: 'John' };
    currentUserSubject.next(user);
    fixture.detectChanges();

    expect(component.getInitials()).toBe('Jo');
  });

  it('should add has-image class when user has avatar', () => {
    const user = { _id: '1', email: 'test@example.com', displayName: 'John Doe', avatar: 'https://example.com/avatar.jpg' };
    currentUserSubject.next(user);
    fixture.detectChanges();

    const avatar = fixture.nativeElement.querySelector('.user-avatar');
    expect(avatar.classList.contains('has-image')).toBe(true);
  });

  it('should not add has-image class when user has no avatar', () => {
    const user = { _id: '1', email: 'test@example.com', displayName: 'John Doe' };
    currentUserSubject.next(user);
    fixture.detectChanges();

    const avatar = fixture.nativeElement.querySelector('.user-avatar');
    expect(avatar.classList.contains('has-image')).toBe(false);
  });

  it('should calculate initials from email when no displayName', () => {
    const user = { _id: '1', email: 'testuser@example.com' };
    currentUserSubject.next(user);
    fixture.detectChanges();

    expect(component.getInitials()).toBe('te');
  });

  it('should toggle menu open/close on click', () => {
    const user = { _id: '1', email: 'test@example.com', displayName: 'John Doe' };
    currentUserSubject.next(user);
    fixture.detectChanges();

    expect(component.isMenuOpen()).toBe(false);
    expect(fixture.nativeElement.querySelector('.user-menu-dropdown')).toBeNull();

    const trigger = fixture.nativeElement.querySelector('.user-menu-trigger');
    trigger.click();
    fixture.detectChanges();

    expect(component.isMenuOpen()).toBe(true);
    expect(fixture.nativeElement.querySelector('.user-menu-dropdown')).toBeTruthy();

    trigger.click();
    fixture.detectChanges();

    expect(component.isMenuOpen()).toBe(false);
    expect(fixture.nativeElement.querySelector('.user-menu-dropdown')).toBeNull();
  });

  it('should display email in dropdown menu', () => {
    const user = { _id: '1', email: 'test@example.com', displayName: 'John Doe' };
    currentUserSubject.next(user);
    fixture.detectChanges();

    component.toggleMenu();
    fixture.detectChanges();

    const userEmail = fixture.nativeElement.querySelector('.user-email');
    expect(userEmail.textContent).toBe('test@example.com');
  });

  it('should call logout and navigate to /login on logout click', () => {
    const user = { _id: '1', email: 'test@example.com', displayName: 'John Doe' };
    currentUserSubject.next(user);
    fixture.detectChanges();

    component.toggleMenu();
    fixture.detectChanges();

    const logoutButton = fixture.nativeElement.querySelector('.menu-item');
    logoutButton.click();

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    expect(component.isMenuOpen()).toBe(false);
  });

  it('should close menu after logout', () => {
    const user = { _id: '1', email: 'test@example.com', displayName: 'John Doe' };
    currentUserSubject.next(user);
    fixture.detectChanges();

    component.isMenuOpen.set(true);
    fixture.detectChanges();

    component.logout();

    expect(component.isMenuOpen()).toBe(false);
  });

  describe('Admin mode toggle', () => {
    it('should not show admin toggle for non-admin users', () => {
      const user = { _id: '1', email: 'test@example.com', displayName: 'John Doe' };
      currentUserSubject.next(user);
      mockAuthService.isAdmin.set(false);
      fixture.detectChanges();

      component.toggleMenu();
      fixture.detectChanges();

      const adminToggle = fixture.nativeElement.querySelector('.menu-item-admin');
      expect(adminToggle).toBeNull();
    });

    it('should show admin toggle for admin users', () => {
      const user = { _id: '1', email: 'test@example.com', displayName: 'John Doe' };
      currentUserSubject.next(user);
      mockAuthService.isAdmin.set(true);
      fixture.detectChanges();

      component.toggleMenu();
      fixture.detectChanges();

      const adminToggle = fixture.nativeElement.querySelector('.menu-item-admin');
      expect(adminToggle).toBeTruthy();
    });

    it('should show OFF indicator when admin mode is disabled', () => {
      const user = { _id: '1', email: 'test@example.com', displayName: 'John Doe' };
      currentUserSubject.next(user);
      mockAuthService.isAdmin.set(true);
      mockAuthService.isAdminMode.set(false);
      fixture.detectChanges();

      component.toggleMenu();
      fixture.detectChanges();

      const indicator = fixture.nativeElement.querySelector('.toggle-indicator');
      expect(indicator.textContent.trim()).toBe('OFF');
      expect(indicator.classList.contains('active')).toBe(false);
    });

    it('should show ON indicator when admin mode is enabled', () => {
      const user = { _id: '1', email: 'test@example.com', displayName: 'John Doe' };
      currentUserSubject.next(user);
      mockAuthService.isAdmin.set(true);
      mockAuthService.isAdminMode.set(true);
      fixture.detectChanges();

      component.toggleMenu();
      fixture.detectChanges();

      const indicator = fixture.nativeElement.querySelector('.toggle-indicator');
      expect(indicator.textContent.trim()).toBe('ON');
      expect(indicator.classList.contains('active')).toBe(true);
    });

    it('should call toggleAdminMode when toggle is clicked', () => {
      const user = { _id: '1', email: 'test@example.com', displayName: 'John Doe' };
      currentUserSubject.next(user);
      mockAuthService.isAdmin.set(true);
      fixture.detectChanges();

      component.toggleMenu();
      fixture.detectChanges();

      const adminToggle = fixture.nativeElement.querySelector('.menu-item-admin');
      adminToggle.click();

      expect(mockAuthService.toggleAdminMode).toHaveBeenCalled();
    });
  });
});
