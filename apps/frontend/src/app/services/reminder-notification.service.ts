import { Injectable, signal } from '@angular/core';

export interface Reminder {
  time: string;
  days: number[]; // 0=Mon … 6=Sun
  enabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class ReminderNotificationService {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  readonly isSupported = 'Notification' in window;

  // Signal so Angular templates react to permission changes
  readonly permission = signal<NotificationPermission>(
    this.isSupported ? Notification.permission : 'denied',
  );

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) return 'denied';
    const result = await Notification.requestPermission();
    this.permission.set(result);
    if (result === 'granted') this.start();
    return result;
  }

  start(): void {
    if (this.intervalId !== null) return;
    this.checkReminders();
    this.intervalId = setInterval(() => this.checkReminders(), 30_000);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  checkReminders(): void {
    if (this.permission() !== 'granted') return;
    const reminders = this.loadReminders();
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dayIndex = (now.getDay() + 6) % 7; // JS: 0=Sun → app: 0=Mon

    for (const reminder of reminders) {
      if (!reminder.enabled) continue;
      if (reminder.time !== hhmm) continue;
      if (!reminder.days.includes(dayIndex)) continue;

      const key = `notif:${reminder.time}:${reminder.days.join('')}:${now.toDateString()}:${hhmm}`;
      if (sessionStorage.getItem(key)) continue; // déjà envoyée cette minute

      sessionStorage.setItem(key, '1');
      this.showNotification(reminder.time);
    }
  }

  testNotification(): void {
    if (this.permission() !== 'granted') return;
    try {
      new Notification('FlexiCoach 💪', {
        body: 'Test — Les notifications fonctionnent !',
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'reminder-test',
      });
    } catch (e) {
      console.error('[Notifications] Échec du test :', e);
    }
  }

  private showNotification(time: string): void {
    try {
      new Notification('FlexiCoach 💪', {
        body: `${time} — C'est l'heure de ta séance !`,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: `reminder-${time}`,
      });
    } catch (e) {
      console.error('[Notifications] Échec :', e);
    }
  }

  private loadReminders(): Reminder[] {
    try {
      const raw = localStorage.getItem('reminders');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
