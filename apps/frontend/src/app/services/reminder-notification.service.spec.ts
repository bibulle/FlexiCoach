import { TestBed } from '@angular/core/testing';
import { ReminderNotificationService } from './reminder-notification.service';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('ReminderNotificationService', () => {
  let service: ReminderNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReminderNotificationService);

    // Mock Notification API (use function syntax for Vitest 4 constructor support)
    Object.defineProperty(window, 'Notification', {
      writable: true,
      value: Object.assign(
        vi.fn(function () { return {}; }),
        {
          permission: 'granted',
          requestPermission: vi.fn().mockResolvedValue('granted'),
        },
      ),
    });

    localStorage.clear();
  });

  afterEach(() => {
    service.stop();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should report permission from Notification API', () => {
    expect(service.permission()).toBe('granted');
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
    service.permission.set('default');
    service.checkReminders();
    expect(window.Notification).not.toHaveBeenCalled();
  });

  it('should not show notification when no reminder matches current time', () => {
    const reminders = [
      { time: '23:59', days: [0, 1, 2, 3, 4, 5, 6], enabled: true },
    ];
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

  describe('Deduplication via localStorage (issue #114)', () => {
    it('should use localStorage instead of sessionStorage for deduplication', () => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const day = (now.getDay() + 6) % 7;
      const reminders = [{ time: hhmm, days: [day], enabled: true }];
      localStorage.setItem('reminders', JSON.stringify(reminders));
      service.checkReminders();

      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith('notif-sent:')) keys.push(k);
      }
      expect(keys.length).toBe(1);
    });

    it('should clean old deduplication keys', () => {
      localStorage.setItem('notif-sent:08:00:01234:Mon Jan 01 2024', '1');
      localStorage.setItem(
        `notif-sent:08:00:01234:${new Date().toDateString()}`,
        '1',
      );

      service.checkReminders();

      expect(
        localStorage.getItem('notif-sent:08:00:01234:Mon Jan 01 2024'),
      ).toBeNull();
      expect(
        localStorage.getItem(
          `notif-sent:08:00:01234:${new Date().toDateString()}`,
        ),
      ).toBe('1');
    });
  });

  describe('Visibility change re-check (issue #114)', () => {
    it('should check reminders when page becomes visible', () => {
      const checkSpy = vi.spyOn(service, 'checkReminders');
      service.start();
      checkSpy.mockClear();

      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        configurable: true,
        writable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));

      expect(checkSpy).toHaveBeenCalled();
    });

    it('should not check reminders when page is hidden', () => {
      const checkSpy = vi.spyOn(service, 'checkReminders');
      service.start();
      checkSpy.mockClear();

      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        configurable: true,
        writable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));

      expect(checkSpy).not.toHaveBeenCalled();
    });

    it('should remove visibilitychange listener on stop', () => {
      const removeSpy = vi.spyOn(document, 'removeEventListener');
      service.start();
      service.stop();

      expect(removeSpy).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function),
      );
    });
  });

  describe('SW sync (issue #114)', () => {
    it('should send reminders to SW active worker via postMessage', async () => {
      const mockPostMessage = vi.fn();
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          controller: {},
          ready: Promise.resolve({
            active: { postMessage: mockPostMessage },
            showNotification: vi.fn(),
          }),
        },
        configurable: true,
        writable: true,
      });

      const reminders = [
        { time: '08:00', days: [0, 1, 2], enabled: true },
      ];
      localStorage.setItem('reminders', JSON.stringify(reminders));

      service.syncRemindersToSW();

      await vi.waitFor(() => {
        expect(mockPostMessage).toHaveBeenCalledWith({
          type: 'SYNC_REMINDERS',
          reminders,
        });
      });
    });

    it('should not fail when no SW available', () => {
      const original = navigator.serviceWorker;
      delete (navigator as any).serviceWorker;

      try {
        expect(() => service.syncRemindersToSW()).not.toThrow();
      } finally {
        Object.defineProperty(navigator, 'serviceWorker', {
          value: original,
          configurable: true,
          writable: true,
        });
      }
    });
  });

  describe('ensureServiceWorker (issue #114)', () => {
    it('should register SW if not already registered', async () => {
      const mockRegister = vi.fn().mockResolvedValue({});
      const mockGetRegistration = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          register: mockRegister,
          getRegistration: mockGetRegistration,
          controller: null,
          ready: Promise.resolve({
            active: null,
            showNotification: vi.fn(),
          }),
        },
        configurable: true,
        writable: true,
      });

      await service.requestPermission();

      await vi.waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith('/sw.js');
      });
    });

    it('should not re-register SW if already registered', async () => {
      const mockRegister = vi.fn();
      const mockGetRegistration = vi.fn().mockResolvedValue({ active: {} });
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          register: mockRegister,
          getRegistration: mockGetRegistration,
          controller: {},
          ready: Promise.resolve({
            active: {},
            showNotification: vi.fn(),
          }),
        },
        configurable: true,
        writable: true,
      });

      await service.requestPermission();

      await new Promise((r) => setTimeout(r, 50));
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  describe('SW-based notifications (issue #105)', () => {
    let mockShowNotification: ReturnType<typeof vi.fn>;
    let originalServiceWorker: ServiceWorkerContainer;

    beforeEach(() => {
      mockShowNotification = vi.fn().mockResolvedValue(undefined);
      originalServiceWorker = navigator.serviceWorker;

      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          controller: {},
          ready: Promise.resolve({
            showNotification: mockShowNotification,
          }),
        },
        configurable: true,
        writable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: originalServiceWorker,
        configurable: true,
        writable: true,
      });
    });

    it('should use SW showNotification when controller is available', async () => {
      service.testNotification();
      await vi.waitFor(() => {
        expect(mockShowNotification).toHaveBeenCalledWith(
          'FlexiCoach 💪',
          expect.objectContaining({ tag: 'reminder-test' }),
        );
      });
    });

    it('should fall back to browser Notification when SW showNotification fails', async () => {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          controller: {},
          ready: Promise.resolve({
            showNotification: vi.fn().mockRejectedValue(new Error('SW error')),
          }),
        },
        configurable: true,
        writable: true,
      });

      service.testNotification();
      await vi.waitFor(() => {
        expect(window.Notification).toHaveBeenCalled();
      });
    });

    it('should use SW for reminder notifications', async () => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const day = (now.getDay() + 6) % 7;
      const reminders = [{ time: hhmm, days: [day], enabled: true }];
      localStorage.setItem('reminders', JSON.stringify(reminders));

      service.checkReminders();

      await vi.waitFor(() => {
        expect(mockShowNotification).toHaveBeenCalledWith(
          'FlexiCoach 💪',
          expect.objectContaining({
            tag: `reminder-${hhmm}`,
          }),
        );
      });
    });
  });
});
