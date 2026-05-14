import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { StatsService, StatsSummary } from '../services/stats.service';
import { ReminderNotificationService } from '../services/reminder-notification.service';
import { APP_VERSION } from '../version';

export interface Reminder {
  time: string;
  days: number[]; // 0=Mon, 1=Tue, ..., 6=Sun
  enabled: boolean;
}

const DEFAULT_REMINDERS: Reminder[] = [
  { time: '08:00', days: [0, 1, 2, 3, 4], enabled: true },
  { time: '19:00', days: [0, 1, 2, 3, 4, 5, 6], enabled: true },
  { time: '12:30', days: [0, 2, 4], enabled: false },
];

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class StatsComponent implements OnInit {
  private statsService = inject(StatsService);
  private router = inject(Router);
  authService = inject(AuthService);
  notifService = inject(ReminderNotificationService);

  summary: StatsSummary | null = null;
  loading = true;
  error: string | null = null;
  selectedTheme = signal<'light' | 'dark' | 'auto'>('auto');
  readonly appVersion = APP_VERSION;
  readonly dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  currentUser = computed(() => {
    let user: any = null;
    this.authService.currentUser$.subscribe((u) => (user = u)).unsubscribe();
    return user;
  });

  // Reminders
  reminders: Reminder[] = [];
  showAddReminder = false;
  newReminderTime = '08:00';
  newReminderDays: number[] = [0, 1, 2, 3, 4];

  // Voice settings
  voiceSpeed = 1.0;
  voiceVolume = 0.7;
  bipsEnabled = true;
  selectedVoiceName = '';
  availableVoices: SpeechSynthesisVoice[] = [];

  // Placeholder stats (future API endpoint)
  readonly dayActivity = [
    { label: 'Lun', count: 5, highlight: true },
    { label: 'Mar', count: 4, highlight: false },
    { label: 'Mer', count: 3, highlight: false },
    { label: 'Jeu', count: 5, highlight: true },
    { label: 'Ven', count: 4, highlight: false },
    { label: 'Sam', count: 1, highlight: false },
    { label: 'Dim', count: 0, highlight: false },
  ];

  readonly topRoutines = [
    { name: 'Squash quotidien', count: 12, pct: 1.0 },
    { name: 'Routine douce', count: 6, pct: 0.5 },
    { name: 'Bureau express', count: 4, pct: 0.33 },
  ];

  ngOnInit(): void {
    this.loadFromStorage();
    this.loadSummary();
    this.loadVoices();
  }

  private voiceQuality(v: SpeechSynthesisVoice): number {
    if (v.name.includes('(Premium)') || v.name.includes('(Enhanced)')) return 2;
    if (!v.localService) return 1; // réseau (ex: Google) — bon mais dépendant de la connexion
    return 0;
  }

  voiceLabel(v: SpeechSynthesisVoice): string {
    const quality = this.voiceQuality(v);
    const baseName = v.name.replace(/\s*\((Enhanced|Premium|Compact)\)/, '');
    if (quality === 2) return `${baseName} ✦✦`;
    if (quality === 1) return `${baseName} ✦`;
    return baseName;
  }

  private loadVoices(): void {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const populate = () => {
      this.availableVoices = synth
        .getVoices()
        .filter(
          (v) =>
            v.lang.startsWith('fr') && !v.name.match(/\(French \([^)]+\)\)/),
        )
        .sort((a, b) => this.voiceQuality(b) - this.voiceQuality(a));
      if (this.availableVoices.length > 0 && !this.selectedVoiceName) {
        this.selectedVoiceName = this.availableVoices[0].name;
      }
    };
    populate();
    synth.addEventListener('voiceschanged', populate);
  }

  private loadFromStorage(): void {
    // Theme
    const savedTheme = localStorage.getItem('theme') as
      | 'light'
      | 'dark'
      | 'auto'
      | null;
    if (savedTheme) {
      this.selectedTheme.set(savedTheme);
      this.applyTheme(savedTheme);
    }

    // Reminders
    try {
      const raw = localStorage.getItem('reminders');
      this.reminders = raw
        ? JSON.parse(raw)
        : [...DEFAULT_REMINDERS.map((r) => ({ ...r, days: [...r.days] }))];
    } catch {
      this.reminders = [
        ...DEFAULT_REMINDERS.map((r) => ({ ...r, days: [...r.days] })),
      ];
    }

    // Voice settings
    try {
      const raw = localStorage.getItem('voiceSettings');
      if (raw) {
        const v = JSON.parse(raw);
        this.voiceSpeed = v.speed ?? 1.0;
        this.voiceVolume = v.volume ?? 0.7;
        this.bipsEnabled = v.bips ?? true;
        this.selectedVoiceName = v.voiceName ?? '';
      }
    } catch {
      /* use defaults */
    }
  }

  private loadSummary(): void {
    this.loading = true;
    this.error = null;
    this.statsService.getSummary().subscribe({
      next: (summary) => {
        this.summary = summary;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les statistiques';
        this.loading = false;
      },
    });
  }

  // ── Stats helpers ──────────────────────────────────────────────────────────

  get formattedMinutes(): string {
    if (!this.summary) return '0';
    const hours = Math.floor(this.summary.totalMinutes / 60);
    const mins = this.summary.totalMinutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}` : ''}`;
    }
    return `${mins}min`;
  }

  get maxDayCount(): number {
    return Math.max(...this.dayActivity.map((d) => d.count), 1);
  }

  // ── Theme ─────────────────────────────────────────────────────────────────

  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.selectedTheme.set(theme);
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: 'light' | 'dark' | 'auto'): void {
    const targets = [document.documentElement, document.body];
    targets.forEach((el) => el.classList.remove('theme-light', 'theme-dark'));
    if (theme === 'light')
      targets.forEach((el) => el.classList.add('theme-light'));
    else if (theme === 'dark')
      targets.forEach((el) => el.classList.add('theme-dark'));
  }

  // ── Reminders ─────────────────────────────────────────────────────────────

  toggleReminder(index: number): void {
    this.reminders[index] = {
      ...this.reminders[index],
      enabled: !this.reminders[index].enabled,
    };
    this.saveReminders();
  }

  deleteReminder(index: number): void {
    this.reminders.splice(index, 1);
    this.saveReminders();
  }

  toggleNewDay(dayIndex: number): void {
    const i = this.newReminderDays.indexOf(dayIndex);
    if (i >= 0) {
      this.newReminderDays.splice(i, 1);
    } else {
      this.newReminderDays.push(dayIndex);
      this.newReminderDays.sort((a, b) => a - b);
    }
  }

  isNewDaySelected(dayIndex: number): boolean {
    return this.newReminderDays.includes(dayIndex);
  }

  addReminder(): void {
    if (!this.newReminderTime) return;
    this.reminders.push({
      time: this.newReminderTime,
      days: [...this.newReminderDays],
      enabled: true,
    });
    this.saveReminders();
    this.showAddReminder = false;
    this.newReminderTime = '08:00';
    this.newReminderDays = [0, 1, 2, 3, 4];
  }

  cancelAddReminder(): void {
    this.showAddReminder = false;
    this.newReminderTime = '08:00';
    this.newReminderDays = [0, 1, 2, 3, 4];
  }

  private saveReminders(): void {
    localStorage.setItem('reminders', JSON.stringify(this.reminders));
  }

  // ── Voice ─────────────────────────────────────────────────────────────────

  saveVoiceSettings(): void {
    localStorage.setItem(
      'voiceSettings',
      JSON.stringify({
        speed: this.voiceSpeed,
        volume: this.voiceVolume,
        bips: this.bipsEnabled,
        voiceName: this.selectedVoiceName,
      }),
    );
  }

  toggleBips(): void {
    this.bipsEnabled = !this.bipsEnabled;
    this.saveVoiceSettings();
  }

  testVoice(): void {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(
      'Bonjour, je suis votre coach vocal.',
    );
    utterance.lang = 'fr-FR';
    utterance.rate = this.voiceSpeed;
    utterance.volume = this.voiceVolume;
    const voice = this.availableVoices.find(
      (v) => v.name === this.selectedVoiceName,
    );
    if (voice) utterance.voice = voice;
    synth.speak(utterance);
  }

  get speedDisplay(): string {
    return `${Number(this.voiceSpeed).toFixed(1)}×`;
  }

  get volumeDisplay(): string {
    return `${Math.round(Number(this.voiceVolume) * 100)} %`;
  }

  get speedFill(): string {
    return `${((this.voiceSpeed - 0.5) / 1.5) * 100}%`;
  }

  get volumeFill(): string {
    return `${this.voiceVolume * 100}%`;
  }

  // ── Notifications ─────────────────────────────────────────────────────────

  async enableNotifications(): Promise<void> {
    await this.notifService.requestPermission();
  }

  testNotification(): void {
    this.notifService.testNotification();
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
