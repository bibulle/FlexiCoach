import { TestBed } from '@angular/core/testing';
import { ReminderNotificationService } from './reminder-notification.service';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('ReminderNotificationService', () => {
  let service: ReminderNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReminderNotificationService);

    // Mock Notification API
    Object.defineProperty(window, 'Notification', {
      writable: true,
      value: Object.assign(
        vi.fn().mockImplementation(() => ({})),
        { permission: 'granted', requestPermission: vi.fn().mockResolvedValue('granted') }
      ),
    });

    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    service.stop();
    vi.restoreAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should report permission from Notification API', () => {
    expect(service.permission).toBe('granted');
  });

  it('should report isSupported true when Notification exists', () => {
    expect(service.isSupported).toBe(true);
  });

  it('should request permission and start service if granted', async () => {
    const startSpy = vi.spyOn(service, 'start');
    await service.requestPermission();
    expect(startSpy).toHaveBeenCalled();
  });

  it('should not start twice if already running', () => {
    service.start();
    const before = (service as any).intervalId;
    service.start();
    expect((service as any).intervalId).toBe(before);
  });

  it('should clear interval on stop', () => {
    service.start();
    expect((service as any).intervalId).not.toBeNull();
    service.stop();
    expect((service as any).intervalId).toBeNull();
  });

  it('should not show notification when permission is not granted', () => {
    (window.Notification as any).permission = 'default';
    service.checkReminders();
    expect(window.Notification).not.toHaveBeenCalled();
  });

  it('should not show notification when no reminder matches current time', () => {
    const reminders = [{ time: '23:59', days: [0, 1, 2, 3, 4, 5, 6], enabled: true }];
    localStorage.setItem('reminders', JSON.stringify(reminders));
    service.checkReminders();
    expect(window.Notification).not.toHaveBeenCalled();
  });

  it('should not show notification for disabled reminder', () => {
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const day = (now.getDay() + 6) % 7;
    const reminders = [{ time: hhmm, days: [day], enabled: false }];
    localStorage.setItem('reminders', JSON.stringify(reminders));
    service.checkReminders();
    expect(window.Notification).not.toHaveBeenCalled();
  });

  it('should show notification when reminder matches time and day', () => {
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const day = (now.getDay() + 6) % 7;
    const reminders = [{ time: hhmm, days: [day], enabled: true }];
    localStorage.setItem('reminders', JSON.stringify(reminders));
    service.checkReminders();
    expect(window.Notification).toHaveBeenCalledOnce();
  });

  it('should not show notification twice in the same minute', () => {
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const day = (now.getDay() + 6) % 7;
    const reminders = [{ time: hhmm, days: [day], enabled: true }];
    localStorage.setItem('reminders', JSON.stringify(reminders));
    service.checkReminders();
    service.checkReminders();
    expect(window.Notification).toHaveBeenCalledOnce();
  });

  it('should not show notification if day does not match', () => {
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const day = (now.getDay() + 6) % 7;
    const wrongDay = (day + 1) % 7;
    const reminders = [{ time: hhmm, days: [wrongDay], enabled: true }];
    localStorage.setItem('reminders', JSON.stringify(reminders));
    service.checkReminders();
    expect(window.Notification).not.toHaveBeenCalled();
  });
});
