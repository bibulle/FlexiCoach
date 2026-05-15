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
    this.syncRemindersToSW();
    this.checkReminders();
    this.intervalId = setInterval(() => this.checkReminders(), 30_000);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  private onVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') {
      this.checkReminders();
    }
  };

  checkReminders(): void {
    if (this.permission() !== 'granted') return;
    const reminders = this.loadReminders();
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dayIndex = (now.getDay() + 6) % 7;

    for (const reminder of reminders) {
      if (!reminder.enabled) continue;
      if (reminder.time !== hhmm) continue;
      if (!reminder.days.includes(dayIndex)) continue;

      const key = `notif-sent:${reminder.time}:${reminder.days.join('')}:${now.toDateString()}`;
      if (localStorage.getItem(key)) continue;

      localStorage.setItem(key, '1');
      this.showNotification(reminder.time);
    }

    this.cleanOldDeduplicationKeys();
  }

  testNotification(): void {
    if (this.permission() !== 'granted') return;
    this.sendNotification({
      body: 'Test — Les notifications fonctionnent !',
      tag: 'reminder-test',
    });
  }

  syncRemindersToSW(): void {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return;
    const reminders = this.loadReminders();
    navigator.serviceWorker.controller.postMessage({
      type: 'SYNC_REMINDERS',
      reminders,
    });
  }

  private showNotification(time: string): void {
    this.sendNotification({
      body: `${time} — C'est l'heure de ta séance !`,
      tag: `reminder-${time}`,
    });
  }

  private sendNotification(options: { body: string; tag: string }): void {
    const notifOptions = {
      body: options.body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: options.tag,
    };

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready
        .then((reg) => reg.showNotification('FlexiCoach 💪', notifOptions))
        .catch((e) => {
          console.error('[Notifications] SW échec, fallback navigateur :', e);
          this.browserNotification(notifOptions);
        });
    } else {
      this.browserNotification(notifOptions);
    }
  }

  private browserNotification(options: NotificationOptions & { tag?: string }): void {
    try {
      new Notification('FlexiCoach 💪', options);
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

  private cleanOldDeduplicationKeys(): void {
    const today = new Date().toDateString();
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith('notif-sent:') && !key.endsWith(today)) {
        localStorage.removeItem(key);
      }
    }
  }
}
