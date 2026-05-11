import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { BottomNavComponent } from './bottom-nav.component';
import { AuthService } from '../services/auth.service';

describe('BottomNavComponent', () => {
  let component: BottomNavComponent;
  let fixture: ComponentFixture<BottomNavComponent>;
  let mockAuthService: any;

  beforeEach(async () => {
    const isAuthenticatedSignal = signal(true);
    mockAuthService = {
      isAuthenticated: () => isAuthenticatedSignal(),
      _setAuthenticated: (v: boolean) => isAuthenticatedSignal.set(v),
    };

    await TestBed.configureTestingModule({
      imports: [BottomNavComponent, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render 4 nav items when authenticated', () => {
    const items = fixture.nativeElement.querySelectorAll('.bottom-nav-item');
    expect(items.length).toBe(4);
  });

  it('should show Accueil link', () => {
    const items = fixture.nativeElement.querySelectorAll('.bottom-nav-item');
    const labels = Array.from(items).map((el: any) => el.textContent.trim());
    expect(labels.some(l => l.includes('Accueil'))).toBe(true);
  });

  it('should show Calendrier link', () => {
    const items = fixture.nativeElement.querySelectorAll('.bottom-nav-item');
    const labels = Array.from(items).map((el: any) => el.textContent.trim());
    expect(labels.some(l => l.includes('Calendrier'))).toBe(true);
  });

  it('should show Routines link', () => {
    const items = fixture.nativeElement.querySelectorAll('.bottom-nav-item');
    const labels = Array.from(items).map((el: any) => el.textContent.trim());
    expect(labels.some(l => l.includes('Routines'))).toBe(true);
  });

  it('should show Paramètres link', () => {
    const items = fixture.nativeElement.querySelectorAll('.bottom-nav-item');
    const labels = Array.from(items).map((el: any) => el.textContent.trim());
    expect(labels.some(l => l.includes('Param'))).toBe(true);
  });

  it('should not render nav when not authenticated', () => {
    mockAuthService._setAuthenticated(false);
    fixture.detectChanges();
    const nav = fixture.nativeElement.querySelector('.bottom-nav');
    expect(nav).toBeNull();
  });
});
