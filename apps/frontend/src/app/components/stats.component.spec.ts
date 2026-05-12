import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatsComponent } from './stats.component';
import { StatsService, StatsSummary } from '../services/stats.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ReminderNotificationService } from '../services/reminder-notification.service';

describe('StatsComponent', () => {
  let component: StatsComponent;
  let fixture: ComponentFixture<StatsComponent>;
  let mockStatsService: any;
  let mockAuthService: any;
  let mockNotifService: any;

  const mockSummary: StatsSummary = {
    currentStreak: 5,
    longestStreak: 10,
    totalSessions: 25,
    totalMinutes: 250,
    adherenceRate: 75,
    favoriteRoutine: 'Douce 10 min',
  };

  beforeEach(async () => {
    // Reset speechSynthesis.getVoices between tests to avoid cross-test contamination
    (window.speechSynthesis as any).getVoices = () => [];

    mockStatsService = { getSummary: vi.fn() };
    mockAuthService = {
      currentUser$: of(null),
      isAuthenticated: vi.fn(() => false),
      logout: vi.fn(),
    };
    mockNotifService = {
      isSupported: true,
      permission: 'default' as NotificationPermission,
      requestPermission: vi.fn().mockResolvedValue('granted'),
      start: vi.fn(),
      stop: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [StatsComponent, RouterTestingModule],
      providers: [
        { provide: StatsService, useValue: mockStatsService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ReminderNotificationService, useValue: mockNotifService },
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

  it('should save voice settings to localStorage including voiceName', () => {
    component.voiceSpeed = 1.2;
    component.voiceVolume = 0.5;
    component.bipsEnabled = false;
    component.selectedVoiceName = 'Thomas';
    component.saveVoiceSettings();
    const saved = JSON.parse(localStorage.getItem('voiceSettings')!);
    expect(saved.speed).toBeCloseTo(1.2);
    expect(saved.volume).toBeCloseTo(0.5);
    expect(saved.bips).toBe(false);
    expect(saved.voiceName).toBe('Thomas');
  });

  it('should restore voiceName from localStorage on init', () => {
    localStorage.setItem('voiceSettings', JSON.stringify({ speed: 1.0, volume: 0.7, bips: true, voiceName: 'Marie' }));
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    component.ngOnInit();
    expect(component.selectedVoiceName).toBe('Marie');
  });

  it('should call speechSynthesis.speak when testVoice is called', () => {
    const mockSpeak = vi.fn();
    (window.speechSynthesis as any).speak = mockSpeak;
    component.availableVoices = [{ name: 'Amélie', lang: 'fr-FR' }] as SpeechSynthesisVoice[];
    component.selectedVoiceName = 'Amélie';
    component.testVoice();
    expect(mockSpeak).toHaveBeenCalledOnce();
  });

  it('should populate availableVoices from speechSynthesis (French only)', () => {
    const mockVoices = [
      { name: 'Thomas', lang: 'fr-FR' },
      { name: 'Marie', lang: 'fr-FR' },
      { name: 'Alice', lang: 'en-US' },
    ] as SpeechSynthesisVoice[];
    (window.speechSynthesis as any).getVoices = vi.fn().mockReturnValue(mockVoices);
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    component.ngOnInit();
    expect(component.availableVoices.length).toBe(2);
    expect(component.availableVoices.every(v => v.lang.startsWith('fr'))).toBe(true);
  });

  it('should exclude voices with (French (...)) in name', () => {
    const mockVoices = [
      { name: 'Thomas',                    lang: 'fr-FR', localService: true  },
      { name: 'Eddy (French (France))',    lang: 'fr-FR', localService: true  },
      { name: 'Daniel (French (France))',  lang: 'fr-FR', localService: true  },
      { name: 'Google français',           lang: 'fr-FR', localService: false },
    ] as SpeechSynthesisVoice[];
    (window.speechSynthesis as any).getVoices = vi.fn().mockReturnValue(mockVoices);
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    component.ngOnInit();
    expect(component.availableVoices.map(v => v.name)).toEqual(['Google français', 'Thomas']);
  });

  it('should sort voices: network first, local standard last', () => {
    const mockVoices = [
      { name: 'Thomas',          lang: 'fr-FR', localService: true  },
      { name: 'Google français', lang: 'fr-FR', localService: false },
      { name: 'Amélie',          lang: 'fr-FR', localService: true  },
    ] as SpeechSynthesisVoice[];
    (window.speechSynthesis as any).getVoices = vi.fn().mockReturnValue(mockVoices);
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    component.ngOnInit();
    expect(component.availableVoices[0].name).toBe('Google français');
  });

  it('should auto-select first (best) voice when none saved', () => {
    const mockVoices = [
      { name: 'Thomas',          lang: 'fr-FR', localService: true  },
      { name: 'Google français', lang: 'fr-FR', localService: false },
    ] as SpeechSynthesisVoice[];
    (window.speechSynthesis as any).getVoices = vi.fn().mockReturnValue(mockVoices);
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    component.selectedVoiceName = '';
    component.ngOnInit();
    expect(component.selectedVoiceName).toBe('Google français');
  });

  it('voiceLabel should show ✦ for network voice, nothing for local standard', () => {
    const network = { name: 'Google français', lang: 'fr-FR', localService: false } as SpeechSynthesisVoice;
    const std     = { name: 'Thomas',          lang: 'fr-FR', localService: true  } as SpeechSynthesisVoice;
    expect(component.voiceLabel(network)).toBe('Google français ✦');
    expect(component.voiceLabel(std)).toBe('Thomas');
  });

  // ── Notifications ────────────────────────────────────────────────────────

  it('should call requestPermission when enableNotifications is called', async () => {
    await component.enableNotifications();
    expect(mockNotifService.requestPermission).toHaveBeenCalled();
  });

  it('should show activate button when permission is default', () => {
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    mockNotifService.permission = 'default';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.settings-notif-btn')).toBeTruthy();
  });

  it('should not show activate button when permission is granted', () => {
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    mockNotifService.permission = 'granted';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.settings-notif-btn')).toBeNull();
  });

  it('should show denied message when permission is denied', () => {
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    mockNotifService.permission = 'denied';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.settings-notif-denied')).toBeTruthy();
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
