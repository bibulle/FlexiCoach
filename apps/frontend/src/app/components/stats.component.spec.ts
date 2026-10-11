import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatsComponent } from './stats.component';
import { StatsService, StatsSummary } from '../services/stats.service';
import { SettingsService } from '../services/settings.service';
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
  let mockSettingsService: any;
  let mockAuthService: any;
  let mockNotifService: any;

  const mockSummary: StatsSummary = {
    currentStreak: 5,
    longestStreak: 10,
    totalSessions: 25,
    totalMinutes: 250,
    adherenceRate: 75,
    favoriteRoutine: 'Douce 10 min',
    recentSessions: 22,
    weekdayActivity: [5, 4, 3, 5, 4, 1, 0],
    topRoutines: [
      { routineId: 'squash', name: 'Squash quotidien', count: 12 },
      { routineId: 'douce', name: 'Routine douce', count: 6 },
      { routineId: 'bureau', name: 'Bureau express', count: 4 },
    ],
  };

  /** Summary of a brand new account: no session at all. */
  const emptySummary: StatsSummary = {
    currentStreak: 0,
    longestStreak: 0,
    totalSessions: 0,
    totalMinutes: 0,
    adherenceRate: 0,
    favoriteRoutine: null,
    recentSessions: 0,
    weekdayActivity: [0, 0, 0, 0, 0, 0, 0],
    topRoutines: [],
  };

  beforeEach(async () => {
    // Reset speechSynthesis.getVoices between tests to avoid cross-test contamination
    (window.speechSynthesis as any).getVoices = () => [];

    mockStatsService = { getSummary: vi.fn() };
    mockSettingsService = {
      load: vi.fn().mockReturnValue(of(null)),
      save: vi.fn().mockReturnValue(of(null)),
    };
    mockAuthService = {
      currentUser$: of(null),
      isAuthenticated: vi.fn(() => false),
      logout: vi.fn(),
    };
    mockNotifService = {
      isSupported: true,
      permission: vi.fn().mockReturnValue('default' as NotificationPermission),
      requestPermission: vi.fn().mockResolvedValue('granted'),
      start: vi.fn(),
      stop: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [StatsComponent, RouterTestingModule],
      providers: [
        { provide: StatsService, useValue: mockStatsService },
        { provide: SettingsService, useValue: mockSettingsService },
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
    mockStatsService.getSummary.mockReturnValue(
      throwError(() => new Error('fail')),
    );
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
    mockStatsService.getSummary.mockReturnValue(
      of({ ...mockSummary, totalMinutes: 45 }),
    );
    fixture.detectChanges();
    expect(component.formattedMinutes).toBe('45min');
  });

  it('should format minutes — hours and minutes', () => {
    mockStatsService.getSummary.mockReturnValue(
      of({ ...mockSummary, totalMinutes: 125 }),
    );
    fixture.detectChanges();
    expect(component.formattedMinutes).toBe('2h 5');
  });

  it('should format minutes — exact hours', () => {
    mockStatsService.getSummary.mockReturnValue(
      of({ ...mockSummary, totalMinutes: 120 }),
    );
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
    expect(
      fixture.nativeElement.querySelector('.settings-stat--hl'),
    ).toBeTruthy();
  });

  it('should display 7 day-activity bar rows', () => {
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelectorAll('.settings-bar-row').length,
    ).toBe(7);
  });

  it('should display 3 top-routine rows', () => {
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelectorAll('.settings-routine-row').length,
    ).toBe(3);
  });

  it('should compute maxDayCount from dayActivity', () => {
    component.summary = mockSummary;
    expect(component.maxDayCount).toBe(5);
  });

  // ── Issue #148: real data instead of hard-coded figures ───────────────────

  describe('activity blocks fed by the API (issue #148)', () => {
    const el = () => fixture.nativeElement as HTMLElement;
    const texts = (selector: string) =>
      Array.from(el().querySelectorAll(selector)).map((e) =>
        e.textContent?.trim(),
      );
    const load = (summary: StatsSummary) => {
      mockStatsService.getSummary.mockReturnValue(of(summary));
      fixture.detectChanges();
    };

    it('should have no activity before the summary is loaded', () => {
      expect(component.dayActivity.map((d) => d.count)).toEqual([
        0, 0, 0, 0, 0, 0, 0,
      ]);
      expect(component.topRoutines).toEqual([]);
      expect(component.hasRecentActivity).toBe(false);
      expect(component.maxDayCount).toBe(1);
    });

    it('should show the weekday counts returned by the API, Monday first', () => {
      load({ ...mockSummary, weekdayActivity: [2, 0, 1, 0, 0, 0, 7] });

      expect(texts('.settings-bar-label')).toEqual([
        'Lun',
        'Mar',
        'Mer',
        'Jeu',
        'Ven',
        'Sam',
        'Dim',
      ]);
      expect(texts('.settings-bar-count')).toEqual([
        '2',
        '0',
        '1',
        '0',
        '0',
        '0',
        '7',
      ]);
    });

    it('should size the bars relative to the busiest weekday', () => {
      load({ ...mockSummary, weekdayActivity: [2, 0, 1, 0, 0, 0, 4] });

      const widths = Array.from(
        el().querySelectorAll<HTMLElement>('.settings-bar-fill'),
      ).map((bar) => bar.style.width);
      expect(widths).toEqual(['50%', '0%', '25%', '0%', '0%', '0%', '100%']);
    });

    it('should highlight every busiest weekday, and only them', () => {
      load({ ...mockSummary, weekdayActivity: [5, 4, 3, 5, 4, 1, 0] });

      expect(component.dayActivity.map((d) => d.highlight)).toEqual([
        true,
        false,
        false,
        true,
        false,
        false,
        false,
      ]);
      expect(el().querySelectorAll('.settings-bar-fill--hi').length).toBe(2);
    });

    it('should show the number of sessions of the last 30 days', () => {
      load(mockSummary);
      expect(el().querySelector('.settings-avg')?.textContent).toContain(
        '30 derniers jours · 22 séances',
      );
    });

    it('should not pluralise a single session', () => {
      load({ ...mockSummary, recentSessions: 1 });
      expect(component.recentSessionsLabel).toBe('1 séance');
    });

    it('should list the top routines returned by the API', () => {
      load(mockSummary);

      expect(texts('.settings-routine-name')).toEqual([
        'Squash quotidien',
        'Routine douce',
        'Bureau express',
      ]);
      expect(texts('.settings-routine-count')).toEqual(['12×', '6×', '4×']);
      expect(el().querySelector('.settings-empty')).toBeNull();
    });

    it('should size the routine bars relative to the first one', () => {
      load(mockSummary);

      expect(component.topRoutines.map((r) => r.pct)).toEqual([1, 0.5, 4 / 12]);
    });

    it('should show the routines of this user, not hard-coded ones', () => {
      load({
        ...mockSummary,
        topRoutines: [{ routineId: 'r1', name: 'Ma routine perso', count: 2 }],
      });

      expect(texts('.settings-routine-name')).toEqual(['Ma routine perso']);
      expect(el().textContent).not.toContain('Squash quotidien');
      expect(el().textContent).not.toContain('Bureau express');
    });

    it('should cope with two routines sharing the same name', () => {
      load({
        ...mockSummary,
        topRoutines: [
          { routineId: 'a', name: 'Routine supprimée', count: 3 },
          { routineId: 'b', name: 'Routine supprimée', count: 1 },
        ],
      });

      expect(el().querySelectorAll('.settings-routine-row').length).toBe(2);
    });

    describe('empty state (account without any session)', () => {
      beforeEach(() => load(emptySummary));

      it('should not show any fake figure', () => {
        expect(el().textContent).not.toContain('Squash quotidien');
        expect(el().textContent).not.toContain('moy. 4');
        expect(texts('.settings-bar-count')).toEqual([
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
        ]);
        expect(el().querySelectorAll('.settings-bar-fill--hi').length).toBe(0);
      });

      it('should explain that there is no session yet in both blocks', () => {
        const messages = texts('.settings-empty');
        expect(messages.length).toBe(2);
        expect(messages[0]).toContain(
          'Pas encore de séance sur les 30 derniers jours',
        );
        expect(messages[1]).toContain('Pas encore de séance');
        expect(el().querySelectorAll('.settings-routine-row').length).toBe(0);
        expect(el().querySelector('.settings-avg')?.textContent).toContain(
          '0 séance',
        );
      });

      it('should keep empty bars without dividing by zero', () => {
        const widths = Array.from(
          el().querySelectorAll<HTMLElement>('.settings-bar-fill'),
        ).map((bar) => bar.style.width);
        expect(widths).toEqual(['0%', '0%', '0%', '0%', '0%', '0%', '0%']);
      });
    });

    it('should tolerate a summary without the new fields (older API)', () => {
      load({
        currentStreak: 1,
        longestStreak: 1,
        totalSessions: 1,
        totalMinutes: 10,
        adherenceRate: 3,
        favoriteRoutine: null,
      } as unknown as StatsSummary);

      expect(el().querySelectorAll('.settings-bar-row').length).toBe(7);
      expect(component.topRoutines).toEqual([]);
      expect(texts('.settings-empty').length).toBe(2);
    });
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
    localStorage.setItem(
      'voiceSettings',
      JSON.stringify({
        speed: 1.0,
        volume: 0.7,
        bips: true,
        voiceName: 'Marie',
      }),
    );
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    component.ngOnInit();
    expect(component.selectedVoiceName).toBe('Marie');
  });

  it('should call speechSynthesis.speak when testVoice is called', () => {
    const mockSpeak = vi.fn();
    (window.speechSynthesis as any).speak = mockSpeak;
    component.availableVoices = [
      { name: 'Amélie', lang: 'fr-FR' },
    ] as SpeechSynthesisVoice[];
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
    (window.speechSynthesis as any).getVoices = vi
      .fn()
      .mockReturnValue(mockVoices);
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    component.ngOnInit();
    expect(component.availableVoices.length).toBe(2);
    expect(
      component.availableVoices.every((v) => v.lang.startsWith('fr')),
    ).toBe(true);
  });

  it('should exclude voices with (French (...)) in name', () => {
    const mockVoices = [
      { name: 'Thomas', lang: 'fr-FR', localService: true },
      { name: 'Eddy (French (France))', lang: 'fr-FR', localService: true },
      { name: 'Daniel (French (France))', lang: 'fr-FR', localService: true },
      { name: 'Google français', lang: 'fr-FR', localService: false },
    ] as SpeechSynthesisVoice[];
    (window.speechSynthesis as any).getVoices = vi
      .fn()
      .mockReturnValue(mockVoices);
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    component.ngOnInit();
    expect(component.availableVoices.map((v) => v.name)).toEqual([
      'Google français',
      'Thomas',
    ]);
  });

  it('should sort voices: network first, local standard last', () => {
    const mockVoices = [
      { name: 'Thomas', lang: 'fr-FR', localService: true },
      { name: 'Google français', lang: 'fr-FR', localService: false },
      { name: 'Amélie', lang: 'fr-FR', localService: true },
    ] as SpeechSynthesisVoice[];
    (window.speechSynthesis as any).getVoices = vi
      .fn()
      .mockReturnValue(mockVoices);
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    component.ngOnInit();
    expect(component.availableVoices[0].name).toBe('Google français');
  });

  it('should auto-select first (best) voice when none saved', () => {
    const mockVoices = [
      { name: 'Thomas', lang: 'fr-FR', localService: true },
      { name: 'Google français', lang: 'fr-FR', localService: false },
    ] as SpeechSynthesisVoice[];
    (window.speechSynthesis as any).getVoices = vi
      .fn()
      .mockReturnValue(mockVoices);
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    component.selectedVoiceName = '';
    component.ngOnInit();
    expect(component.selectedVoiceName).toBe('Google français');
  });

  it('voiceLabel should show ✦ for network voice, nothing for local standard', () => {
    const network = {
      name: 'Google français',
      lang: 'fr-FR',
      localService: false,
    } as SpeechSynthesisVoice;
    const std = {
      name: 'Thomas',
      lang: 'fr-FR',
      localService: true,
    } as SpeechSynthesisVoice;
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
    mockNotifService.permission.mockReturnValue('default');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.settings-notif-btn'),
    ).toBeTruthy();
  });

  it('should not show activate button when permission is granted', () => {
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    mockNotifService.permission.mockReturnValue('granted');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.settings-notif-btn'),
    ).toBeNull();
  });

  it('should show active indicator when permission is granted', () => {
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    mockNotifService.permission.mockReturnValue('granted');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.settings-notif-active'),
    ).toBeTruthy();
  });

  it('should show denied message when permission is denied', () => {
    mockStatsService.getSummary.mockReturnValue(of(mockSummary));
    mockNotifService.permission.mockReturnValue('denied');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.settings-notif-denied'),
    ).toBeTruthy();
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
