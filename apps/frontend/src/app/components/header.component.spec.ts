import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';
import { HeaderComponent } from './header.component';
import { AuthService } from '../services/auth.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockAuthService: any;
  let router: Router;

  beforeEach(async () => {
    const isAuthenticatedSignal = signal(true);
    const isAdminSignal = signal(false);

    mockAuthService = {
      isAuthenticated: () => isAuthenticatedSignal(),
      isAdmin: () => isAdminSignal(),
      currentUser$: new BehaviorSubject(null),
      logout: vi.fn(),
      _setAuthenticated: (value: boolean) => isAuthenticatedSignal.set(value),
      _setAdmin: (value: boolean) => isAdminSignal.set(value),
    };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display logo with routerLink to /', () => {
    fixture.detectChanges();

    const logo = fixture.nativeElement.querySelector('.logo');
    expect(logo).toBeTruthy();
    // In test environment, routerLink is a directive attribute, not href
    expect(logo.hasAttribute('ng-reflect-router-link') || logo.getAttribute('routerlink') === '/').toBeTruthy();

    const logoText = fixture.nativeElement.querySelector('.logo-text');
    expect(logoText.textContent).toBe('FlexiCoach');
  });

  it('should display navigation when authenticated', () => {
    mockAuthService._setAuthenticated(true);
    fixture.detectChanges();

    const navLinks = fixture.nativeElement.querySelectorAll('.nav-link');
    expect(navLinks.length).toBeGreaterThan(0);

    const routinesLink = Array.from(navLinks).find((link: any) =>
      link.textContent.trim() === 'Routines'
    );
    expect(routinesLink).toBeTruthy();
  });

  it('should not display navigation when not authenticated', () => {
    mockAuthService._setAuthenticated(false);
    fixture.detectChanges();

    const navLinks = fixture.nativeElement.querySelectorAll('.nav-link');
    expect(navLinks.length).toBe(0);
  });

  it('should display Admin link when user is admin', () => {
    mockAuthService._setAuthenticated(true);
    mockAuthService._setAdmin(true);
    fixture.detectChanges();

    const navLinks = fixture.nativeElement.querySelectorAll('.nav-link');
    const adminLink = Array.from(navLinks).find((link: any) =>
      link.textContent.trim() === 'Admin'
    );
    expect(adminLink).toBeTruthy();
  });

  it('should not display Admin link when user is not admin', () => {
    mockAuthService._setAuthenticated(true);
    mockAuthService._setAdmin(false);
    fixture.detectChanges();

    const navLinks = fixture.nativeElement.querySelectorAll('.nav-link');
    const adminLink = Array.from(navLinks).find((link: any) =>
      link.textContent.trim() === 'Admin'
    );
    expect(adminLink).toBeFalsy();
  });

  it('should include UserMenuComponent', () => {
    fixture.detectChanges();

    const userMenu = fixture.nativeElement.querySelector('app-user-menu');
    expect(userMenu).toBeTruthy();
  });

  it('should not display breadcrumbs on root path', () => {
    // Mock the router URL via the actual router instance
    vi.spyOn(router, 'url', 'get').mockReturnValue('/');
    fixture.detectChanges();

    expect(component.breadcrumbs().length).toBe(0);

    const breadcrumbs = fixture.nativeElement.querySelector('.breadcrumbs');
    expect(breadcrumbs).toBeNull();
  });

  it('should not display breadcrumbs on login page', () => {
    vi.spyOn(router, 'url', 'get').mockReturnValue('/login');
    fixture.detectChanges();

    expect(component.breadcrumbs().length).toBe(0);
  });

  it('should display breadcrumbs for /routines/new', () => {
    vi.spyOn(router, 'url', 'get').mockReturnValue('/routines/new');
    fixture.detectChanges();

    const crumbs = component.breadcrumbs();
    expect(crumbs.length).toBe(2);
    expect(crumbs[0]).toEqual({ label: 'Routines', url: '/' });
    expect(crumbs[1]).toEqual({ label: 'Nouvelle routine', url: '/routines/new' });
  });

  it('should display breadcrumbs for /routines/:id/edit', () => {
    vi.spyOn(router, 'url', 'get').mockReturnValue('/routines/123/edit');
    fixture.detectChanges();

    const crumbs = component.breadcrumbs();
    expect(crumbs.length).toBe(2);
    expect(crumbs[0]).toEqual({ label: 'Routines', url: '/' });
    expect(crumbs[1]).toEqual({ label: 'Éditer', url: '/routines/123/edit' });
  });

  it('should display breadcrumbs for /calendar', () => {
    vi.spyOn(router, 'url', 'get').mockReturnValue('/calendar');
    fixture.detectChanges();

    const crumbs = component.breadcrumbs();
    expect(crumbs.length).toBe(2);
    expect(crumbs[0]).toEqual({ label: 'Routines', url: '/' });
    expect(crumbs[1]).toEqual({ label: 'Calendrier', url: '/calendar' });
  });

  it('should display breadcrumbs for /admin', () => {
    vi.spyOn(router, 'url', 'get').mockReturnValue('/admin');
    fixture.detectChanges();

    const crumbs = component.breadcrumbs();
    expect(crumbs.length).toBe(2);
    expect(crumbs[0]).toEqual({ label: 'Routines', url: '/' });
    expect(crumbs[1]).toEqual({ label: 'Administration', url: '/admin' });
  });

  it('should display breadcrumbs for /completion', () => {
    vi.spyOn(router, 'url', 'get').mockReturnValue('/completion');
    fixture.detectChanges();

    const crumbs = component.breadcrumbs();
    expect(crumbs.length).toBe(2);
    expect(crumbs[0]).toEqual({ label: 'Routines', url: '/' });
    expect(crumbs[1]).toEqual({ label: 'Complétion', url: '/completion' });
  });

  it('should update breadcrumbs on navigation', async () => {
    vi.spyOn(router, 'url', 'get').mockReturnValue('/');
    fixture.detectChanges();
    expect(component.breadcrumbs().length).toBe(0);

    // Navigate to /calendar
    vi.spyOn(router, 'url', 'get').mockReturnValue('/calendar');

    // Trigger navigation event manually since we're not actually navigating
    component['buildBreadcrumbs']();
    fixture.detectChanges();

    expect(component.breadcrumbs().length).toBe(2);
    expect(component.breadcrumbs()[1].label).toBe('Calendrier');
  });

  it('should render breadcrumbs in DOM when present', () => {
    vi.spyOn(router, 'url', 'get').mockReturnValue('/calendar');
    fixture.detectChanges();

    const breadcrumbsContainer = fixture.nativeElement.querySelector('.breadcrumbs');
    expect(breadcrumbsContainer).toBeTruthy();

    const links = breadcrumbsContainer.querySelectorAll('.breadcrumb-link');
    expect(links.length).toBe(1);
    expect(links[0].textContent.trim()).toBe('Routines');

    const current = breadcrumbsContainer.querySelector('.current');
    expect(current.textContent.trim()).toBe('Calendrier');

    const separator = breadcrumbsContainer.querySelector('.separator');
    expect(separator.textContent.trim()).toBe('›');
  });

  it('should unsubscribe from router events on destroy', () => {
    fixture.detectChanges();
    const subscription = component['routerSubscription'];
    expect(subscription).toBeTruthy();

    vi.spyOn(subscription!, 'unsubscribe');
    component.ngOnDestroy();

    expect(subscription!.unsubscribe).toHaveBeenCalled();
  });
});
