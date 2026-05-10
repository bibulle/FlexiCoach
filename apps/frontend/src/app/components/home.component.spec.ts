import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HomeComponent } from './home.component';
import { RoutineService } from '../services/routine.service';
import { StatsService } from '../services/stats.service';
import { AuthService } from '../services/auth.service';
import { Routine } from '@flexicoach/shared';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockRoutineService: any;
  let mockStatsService: any;
  let mockAuthService: any;
  let router: Router;

  const mockSummary = {
    currentStreak: 7,
    longestStreak: 14,
    totalSessions: 42,
    totalMinutes: 630,
    adherenceRate: 85,
    favoriteRoutine: 'squash-quotidien',
  };

  const mockRoutines: Routine[] = [
    { id: 'r1', slug: 'r1', name: 'Routine 1', description: '', duration: 10, level: 'Débutant', totalSeconds: 600, steps: [] },
    { id: 'r2', slug: 'r2', name: 'Routine 2', description: '', duration: 15, level: 'Intermédiaire', totalSeconds: 900, steps: [] },
  ];

  beforeEach(async () => {
    mockRoutineService = { getAll: vi.fn().mockReturnValue(of(mockRoutines)) };
    mockStatsService = { getSummary: vi.fn().mockReturnValue(of(mockSummary)) };
    mockAuthService = {
      isAuthenticated: signal(true),
      isAdminMode: signal(false),
      getCurrentUser: vi.fn().mockReturnValue({ displayName: 'Marc Dupont' }),
    };

    await TestBed.configureTestingModule({
      imports: [HomeComponent, RouterTestingModule],
      providers: [
        { provide: RoutineService, useValue: mockRoutineService },
        { provide: StatsService, useValue: mockStatsService },
        { provide: AuthService, useValue: mockAuthService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load stats on init', () => {
    fixture.detectChanges();
    expect(mockStatsService.getSummary).toHaveBeenCalled();
    expect(component.summary).toEqual(mockSummary);
  });

  it('should load up to 4 routines on init', () => {
    fixture.detectChanges();
    expect(mockRoutineService.getAll).toHaveBeenCalled();
    expect(component.routines.length).toBeLessThanOrEqual(4);
  });

  it('should return first name from displayName', () => {
    fixture.detectChanges();
    expect(component.displayName).toBe('Marc');
  });

  it('should return empty displayName when no user', () => {
    mockAuthService.getCurrentUser.mockReturnValue(null);
    fixture.detectChanges();
    expect(component.displayName).toBe('');
  });

  it('should compute adherencePct correctly', () => {
    fixture.detectChanges();
    expect(component.adherencePct).toBeCloseTo(0.85);
  });

  it('should compute streakPct correctly', () => {
    fixture.detectChanges();
    expect(component.streakPct).toBeCloseTo(7 / 14);
  });

  it('should navigate to routine player on selectRoutine', () => {
    fixture.detectChanges();
    component.selectRoutine(mockRoutines[0]);
    expect(router.navigate).toHaveBeenCalledWith(['/routine', 'r1']);
  });

  it('should return correct badge class', () => {
    expect(component.getBadgeClass('Débutant')).toBe('badge-debutant');
    expect(component.getBadgeClass('Intermédiaire')).toBe('badge-intermediaire');
    expect(component.getBadgeClass('Avancé')).toBe('badge-avance');
  });

  it('should handle stats loading error gracefully', () => {
    mockStatsService.getSummary.mockReturnValue(throwError(() => new Error('err')));
    fixture.detectChanges();
    expect(component.summary).toBeNull();
  });

  it('should handle routines loading error gracefully', () => {
    mockRoutineService.getAll.mockReturnValue(throwError(() => new Error('err')));
    fixture.detectChanges();
    expect(component.routines).toEqual([]);
    expect(component.loading).toBe(false);
  });
});
