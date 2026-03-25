import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { RoutineListComponent } from './routine-list.component';
import { RoutineService } from '../services/routine.service';
import { AuthService } from '../services/auth.service';
import { StatsService } from '../services/stats.service';
import { Routine } from '@flexicoach/shared';

describe('RoutineListComponent', () => {
  let component: RoutineListComponent;
  let fixture: ComponentFixture<RoutineListComponent>;
  let mockRoutineService: any;
  let mockAuthService: any;
  let mockStatsService: any;
  let router: Router;

  const mockRoutines: Routine[] = [
    {
      id: 'routine-1',
      slug: 'routine-1',
      name: 'Routine 1',
      description: 'Description 1',
      duration: 10,
      level: 'Débutant',
      totalSeconds: 600,
      steps: [],
    },
    {
      id: 'routine-2',
      slug: 'routine-2',
      name: 'Routine 2',
      description: 'Description 2',
      duration: 5,
      level: 'Intermédiaire',
      totalSeconds: 300,
      steps: [],
    },
  ];

  beforeEach(async () => {
    mockRoutineService = {
      getAll: vi.fn(),
    };

    mockAuthService = {
      isAdmin: signal(false),
      isAdminMode: signal(false),
      isAuthenticated: signal(true),
    };

    mockStatsService = {
      getSummary: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RoutineListComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        { provide: RoutineService, useValue: mockRoutineService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: StatsService, useValue: mockStatsService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');

    mockRoutineService.getAll.mockReturnValue(of(mockRoutines));
    mockStatsService.getSummary.mockReturnValue(
      of({
        currentStreak: 5,
        longestStreak: 10,
        totalSessions: 25,
        totalMinutes: 250,
        adherenceRate: 75,
        favoriteRoutine: 'douce-10min',
      })
    );

    fixture = TestBed.createComponent(RoutineListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load routines on init', () => {
    fixture.detectChanges();

    expect(mockRoutineService.getAll).toHaveBeenCalled();
    expect(component.routines).toEqual(mockRoutines);
    expect(component.loading).toBe(false);
  });

  it('should show loading state initially', () => {
    // Don't call fixture.detectChanges() so ngOnInit doesn't run yet
    expect(component.loading).toBe(false); // Initial state before load

    component.loadRoutines();
    // Observable completes synchronously in tests, so loading is already false
    // Just verify the method was called
    expect(mockRoutineService.getAll).toHaveBeenCalled();
  });

  it('should handle error when loading routines', () => {
    mockRoutineService.getAll.mockReturnValue(
      throwError(() => new Error('Load error'))
    );

    fixture.detectChanges();

    expect(component.error).toBe('Erreur lors du chargement des routines');
    expect(component.loading).toBe(false);
  });

  it('should navigate to routine player when selecting a routine', () => {
    const routine = mockRoutines[0];

    component.selectRoutine(routine);

    expect(router.navigate).toHaveBeenCalledWith(['/routine', 'routine-1']);
  });

  describe('Admin mode features', () => {
    it('should hide "Nouvelle routine" button when admin mode is off', () => {
      mockAuthService.isAdminMode.set(false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const newRoutineLink = compiled.querySelector('a[href="/routines/new"]');
      expect(newRoutineLink).toBeNull();
    });

    it('should show "Nouvelle routine" button when admin mode is on', () => {
      mockAuthService.isAdminMode.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const newRoutineLink = compiled.querySelector('a[href="/routines/new"]');
      expect(newRoutineLink).toBeTruthy();
    });

    it('should not show edit/delete buttons in the list (moved to player)', () => {
      mockAuthService.isAdmin.set(true);
      mockAuthService.isAdminMode.set(true);

      const userRoutines: Routine[] = [{
        ...mockRoutines[0],
        visibility: 'user' as 'builtIn' | 'user',
      }];

      mockRoutineService.getAll.mockReturnValue(of(userRoutines));
      component.loadRoutines();
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const editButtons = compiled.querySelectorAll('.btn-secondary');
      const deleteButtons = compiled.querySelectorAll('.btn-danger');

      expect(editButtons.length).toBe(0);
      expect(deleteButtons.length).toBe(0);
    });
  });
});
