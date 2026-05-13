import { TestBed } from '@angular/core/testing';
import { SwUpdateService } from './sw-update.service';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('SwUpdateService', () => {
  let service: SwUpdateService;
  let mockServiceWorkerRegistration: any;
  let mockServiceWorker: any;

  beforeEach(() => {
    // Mock ServiceWorker API
    mockServiceWorker = {
      state: 'activated',
      postMessage: vi.fn(),
      addEventListener: vi.fn(),
    };

    mockServiceWorkerRegistration = {
      installing: null,
      waiting: null,
      active: mockServiceWorker,
      update: vi.fn().mockResolvedValue(undefined),
      addEventListener: vi.fn(),
    };

    // Mock navigator.serviceWorker
    Object.defineProperty(global.navigator, 'serviceWorker', {
      writable: true,
      configurable: true,
      value: {
        ready: Promise.resolve(mockServiceWorkerRegistration),
        controller: mockServiceWorker,
        addEventListener: vi.fn(),
      },
    });

    TestBed.configureTestingModule({
      providers: [SwUpdateService],
    });

    service = TestBed.inject(SwUpdateService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with updateAvailable$ as false', async () => {
    const available = await new Promise<boolean>((resolve) => {
      service.updateAvailable$.subscribe((value) => resolve(value));
    });
    expect(available).toBe(false);
  });

  it('should call update on service worker registration when checking for updates', async () => {
    service.checkForUpdates();

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockServiceWorkerRegistration.update).toHaveBeenCalled();
  });

  it('should register updatefound listener', async () => {
    service.checkForUpdates();

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockServiceWorkerRegistration.addEventListener).toHaveBeenCalledWith(
      'updatefound',
      expect.any(Function),
    );
  });

  it('should register controllerchange listener on navigator.serviceWorker', () => {
    service.checkForUpdates();

    expect(navigator.serviceWorker.addEventListener).toHaveBeenCalledWith(
      'controllerchange',
      expect.any(Function),
    );
  });

  it('should emit true when new service worker is installed', async () => {
    const newWorker = {
      state: 'installing',
      addEventListener: vi.fn((event: string, callback: Function) => {
        if (event === 'statechange') {
          // Simulate state change
          setTimeout(() => {
            newWorker.state = 'installed';
            callback();
          }, 0);
        }
      }),
    };

    mockServiceWorkerRegistration.installing = newWorker;

    let updateAvailable = false;
    service.updateAvailable$.subscribe((available) => {
      updateAvailable = available;
    });

    service.checkForUpdates();

    await new Promise((resolve) => setTimeout(resolve, 10));

    // Trigger updatefound event
    const updatefoundCallback =
      mockServiceWorkerRegistration.addEventListener.mock.calls.find(
        (call: any) => call[0] === 'updatefound',
      )?.[1];

    if (updatefoundCallback) {
      updatefoundCallback();
    }

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(updateAvailable).toBe(true);
  });

  it('should post SKIP_WAITING message when applyUpdate is called with waiting worker', () => {
    const waitingWorker = {
      postMessage: vi.fn(),
    };

    service['registration'] = {
      ...mockServiceWorkerRegistration,
      waiting: waitingWorker,
    };

    service.applyUpdate();

    expect(waitingWorker.postMessage).toHaveBeenCalledWith({
      type: 'SKIP_WAITING',
    });
  });

  it('should not post message when applyUpdate is called without waiting worker', () => {
    service['registration'] = {
      ...mockServiceWorkerRegistration,
      waiting: null,
    };

    service.applyUpdate();

    // Should not throw error
    expect(service['registration']).toBeTruthy();
  });

  it('should not check for updates when serviceWorker is not available', () => {
    // Delete serviceWorker from navigator
    const originalServiceWorker = Object.getOwnPropertyDescriptor(
      global.navigator,
      'serviceWorker',
    );

    // @ts-ignore - intentionally delete to test behavior
    delete (global.navigator as any).serviceWorker;

    service.checkForUpdates();

    // Should not throw error
    expect(service).toBeTruthy();

    // Restore serviceWorker
    if (originalServiceWorker) {
      Object.defineProperty(
        global.navigator,
        'serviceWorker',
        originalServiceWorker,
      );
    }
  });

  it('should handle updateAvailableSubject as BehaviorSubject', () => {
    expect(service.updateAvailableSubject).toBeTruthy();
    expect(service.updateAvailableSubject.value).toBe(false);

    service.updateAvailableSubject.next(true);
    expect(service.updateAvailableSubject.value).toBe(true);
  });
});
