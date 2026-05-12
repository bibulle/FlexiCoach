import { Injectable } from '@angular/core';

export interface Reminder {
  time: string;
  days: number[]; // 0=Mon … 6=Sun
  enabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class ReminderNotificationService {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  get permission(): NotificationPermission {
    return 'Notification' in window ? Notification.permission : 'denied';
  }

  get isSupported(): boolean {
    return 'Notification' in window;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) return 'denied';
    const result = await Notification.requestPermission();
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
    if (this.permission !== 'granted') return;
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

  private showNotification(time: string): void {
    new Notification('FlexiCoach 💪', {
      body: `${time} — C'est l'heure de ta séance !`,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: `reminder-${time}`,
    });
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
