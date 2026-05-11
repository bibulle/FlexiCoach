import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatsComponent } from './stats.component';
import { StatsService, StatsSummary } from '../services/stats.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('StatsComponent', () => {
  let component: StatsComponent;
  let fixture: ComponentFixture<StatsComponent>;
  let mockStatsService: any;
  let mockAuthService: any;

  const mockSummary: StatsSummary = {
    currentStreak: 5,
    longestStreak: 10,
    totalSessions: 25,
    totalMinutes: 250,
    adherenceRate: 75,
    favoriteRoutine: 'Douce 10 min',
  };

  beforeEach(async () => {
    mockStatsService = { getSummary: vi.fn() };
    mockAuthService = {
      currentUser$: of(null),
      isAuthenticated: vi.fn(() => false),
      logout: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [StatsComponent, RouterTestingModule],
      providers: [
        { provide: StatsService, useValue: mockStatsService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load summary on init', () => {
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    fixture.detectChanges();
    expect(component.summary).toEqual(mockSummary);
    expect(component.loading).toBe(false);
    expect(component.error).toBeNull();
  });

  it('should handle error when loading fails', () => {
    mockStatsService.getSummary.mockReturnValue(throwError(() => new Error('fail')));
    fixture.detectChanges();
    expect(component.loading).toBe(false);
    expect(component.error).toBe('Impossible de charger les statistiques');
  });

  it('should display summary stats when loaded', () => {
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('5');
    expect(el.textContent).toContain('25');
    expect(el.textContent).toContain('75');
  });

  it('should format minutes — only minutes', () => {
    mockStatsService.getSummary.mockReturnValue(of({ ...mockSummary, totalMinutes: 45 }));
    fixture.detectChanges();
    expect(component.formattedMinutes).toBe('45min');
  });

  it('should format minutes — hours and minutes', () => {
    mockStatsService.getSummary.mockReturnValue(of({ ...mockSummary, totalMinutes: 125 }));
    fixture.detectChanges();
    expect(component.formattedMinutes).toBe('2h 5');
  });

  it('should format minutes — exact hours', () => {
    mockStatsService.getSummary.mockReturnValue(of({ ...mockSummary, totalMinutes: 120 }));
    fixture.detectChanges();
    expect(component.formattedMinutes).toBe('2h');
  });

  it('should display 4 big stat cards', () => {
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('.settings-stat');
    expect(cards.length).toBe(4);
  });

  it('should highlight the streak card', () => {
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.settings-stat--hl')).toBeTruthy();
  });

  it('should display 7 day-activity bar rows', () => {
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.settings-bar-row').length).toBe(7);
  });

  it('should display 3 top-routine rows', () => {
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.settings-routine-row').length).toBe(3);
  });

  it('should compute maxDayCount from dayActivity', () => {
    expect(component.maxDayCount).toBe(5);
  });

  // ── Theme ────────────────────────────────────────────────────────────────

  it('should initialize selectedTheme to auto', () => {
    expect(component.selectedTheme()).toBe('auto');
  });

  it('should update selectedTheme and persist to localStorage', () => {
    component.setTheme('dark');
    expect(component.selectedTheme()).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('should restore theme from localStorage on init', () => {
    localStorage.setItem('theme', 'light');
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    component.ngOnInit();
    expect(component.selectedTheme()).toBe('light');
  });

  // ── Reminders ────────────────────────────────────────────────────────────

  it('should load default reminders when localStorage is empty', () => {
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    fixture.detectChanges();
    expect(component.reminders.length).toBe(3);
  });

  it('should toggle reminder enabled state', () => {
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    fixture.detectChanges();
    const was = component.reminders[0].enabled;
    component.toggleReminder(0);
    expect(component.reminders[0].enabled).toBe(!was);
  });

  it('should persist reminders to localStorage after toggle', () => {
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    fixture.detectChanges();
    component.toggleReminder(0);
    expect(localStorage.getItem('reminders')).not.toBeNull();
  });

  it('should delete a reminder', () => {
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    fixture.detectChanges();
    const before = component.reminders.length;
    component.deleteReminder(0);
    expect(component.reminders.length).toBe(before - 1);
  });

  it('should add a new reminder', () => {
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    fixture.detectChanges();
    const before = component.reminders.length;
    component.newReminderTime = '10:00';
    component.newReminderDays = [0, 1];
    component.addReminder();
    expect(component.reminders.length).toBe(before + 1);
    expect(component.reminders[before].time).toBe('10:00');
    expect(component.showAddReminder).toBe(false);
  });

  it('should not add reminder when time is empty', () => {
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    fixture.detectChanges();
    const before = component.reminders.length;
    component.newReminderTime = '';
    component.addReminder();
    expect(component.reminders.length).toBe(before);
  });

  it('should cancel adding a reminder', () => {
    component.showAddReminder = true;
    component.newReminderTime = '15:00';
    component.cancelAddReminder();
    expect(component.showAddReminder).toBe(false);
    expect(component.newReminderTime).toBe('08:00');
  });

  it('should toggle a day in the new reminder form', () => {
    component.newReminderDays = [0, 1, 2];
    component.toggleNewDay(1); // remove Tue
    expect(component.newReminderDays).not.toContain(1);
    component.toggleNewDay(1); // re-add Tue
    expect(component.newReminderDays).toContain(1);
  });

  it('isNewDaySelected should return true for selected day', () => {
    component.newReminderDays = [0, 2, 4];
    expect(component.isNewDaySelected(0)).toBe(true);
    expect(component.isNewDaySelected(1)).toBe(false);
  });

  // ── Voice ────────────────────────────────────────────────────────────────

  it('should format speedDisplay correctly', () => {
    component.voiceSpeed = 1.5;
    expect(component.speedDisplay).toBe('1.5×');
  });

  it('should format volumeDisplay correctly', () => {
    component.voiceVolume = 0.7;
    expect(component.volumeDisplay).toBe('70 %');
  });

  it('should toggle bips and save', () => {
    component.bipsEnabled = true;
    component.toggleBips();
    expect(component.bipsEnabled).toBe(false);
    expect(localStorage.getItem('voiceSettings')).toContain('"bips":false');
  });

  it('should save voice settings to localStorage', () => {
    component.voiceSpeed = 1.2;
    component.voiceVolume = 0.5;
    component.bipsEnabled = false;
    component.saveVoiceSettings();
    const saved = JSON.parse(localStorage.getItem('voiceSettings')!);
    expect(saved.speed).toBeCloseTo(1.2);
    expect(saved.volume).toBeCloseTo(0.5);
    expect(saved.bips).toBe(false);
  });

  // ── Logout ───────────────────────────────────────────────────────────────

  it('should call logout and navigate to /login', () => {
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
