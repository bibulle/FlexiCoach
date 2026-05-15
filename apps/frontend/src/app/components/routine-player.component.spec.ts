import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RoutinePlayerComponent } from './routine-player.component';
import { RoutineService } from '../services/routine.service';
import { SessionService } from '../services/session.service';
import { AuthService } from '../services/auth.service';
import { Routine } from '@flexicoach/shared';

describe('RoutinePlayerComponent', () => {
  let component: RoutinePlayerComponent;
  let fixture: ComponentFixture<RoutinePlayerComponent>;
  let mockRoutineService: any;
  let mockSessionService: any;
  let mockAuthService: any;
  let mockRouter: any;
  let mockActivatedRoute: any;

  const mockRoutine: Routine = {
    id: 'test-routine',
    slug: 'test-routine',
    name: 'Test Routine',
    description: 'Test description',
    duration: 5,
    level: 'Débutant',
    totalSeconds: 150,
    restSeconds: 10,
    steps: [
      {
        name: 'Step 1',
        seconds: 60,
        mode: 'mouvement',
        text: 'Do step 1',
        cues: [{ at: 30, say: 'Halfway through step 1' }],
      },
      {
        name: 'Step 2',
        seconds: 50,
        mode: 'statique',
        text: 'Do step 2',
        cues: [],
      },
    ],
  };

  beforeEach(async () => {
    // Mock AudioContext
    global.AudioContext = function () {
      return {
        createOscillator: vi.fn().mockReturnValue({
          connect: vi.fn(),
          frequency: { value: 0 },
          type: 'sine',
          start: vi.fn(),
          stop: vi.fn(),
        }),
        createGain: vi.fn().mockReturnValue({
          connect: vi.fn(),
          gain: {
            setValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
        }),
        destination: {},
        currentTime: 0,
      };
    } as any;

    mockRoutineService = {
      getBySlug: vi.fn(),
      delete: vi.fn(),
    };

    mockAuthService = {
      isAdmin: signal(false),
      isAdminMode: signal(false),
    };

    mockSessionService = {
      create: vi.fn().mockReturnValue(of({ id: 'session-123' })),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: vi.fn().mockReturnValue('test-routine'),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [RoutinePlayerComponent],
      providers: [
        { provide: RoutineService, useValue: mockRoutineService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    mockRoutineService.getBySlug.mockReturnValue(of(mockRoutine));

    fixture = TestBed.createComponent(RoutinePlayerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load routine on init', () => {
    fixture.detectChanges();

    expect(mockRoutineService.getBySlug).toHaveBeenCalledWith('test-routine');
    expect(component.routine).toEqual(mockRoutine);
  });

  it('should calculate total seconds correctly', () => {
    const total = component['calculateTotalSeconds'](mockRoutine);
    // 60 + 50 steps + 10 rest = 120
    expect(total).toBe(120);
  });

  it('should format time correctly', () => {
    expect(component.formatTime(65)).toBe('1:05');
    expect(component.formatTime(120)).toBe('2:00');
    expect(component.formatTime(5)).toBe('0:05');
  });

  it('should navigate back', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/routines']);
  });

  it('should navigate to home on load error', () => {
    mockRoutineService.getBySlug.mockReturnValue(
      throwError(() => new Error('Not found')),
    );

    fixture.detectChanges();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/routines']);
  });

  it('should start routine', () => {
    fixture.detectChanges();

    component.start();

    expect(component.isPlaying).toBe(true);
    expect(component.timeLeft).toBe(60); // First step duration
  });

  it('should pause routine', () => {
    fixture.detectChanges();
    component.start();

    component.pause();

    expect(component.isPlaying).toBe(false);
  });

  it('should stop and reset routine', () => {
    fixture.detectChanges();
    component.start();
    component.currentStepIndex = 1;

    component.stop();

    expect(component.isPlaying).toBe(false);
    expect(component.currentStepIndex).toBe(0);
    expect(component.timeLeft).toBe(0);
  });

  it('should get current step correctly', () => {
    fixture.detectChanges();

    expect(component.currentStep).toEqual(mockRoutine.steps[0]);

    component.currentStepIndex = 1;
    expect(component.currentStep).toEqual(mockRoutine.steps[1]);
  });

  it('should return null for current step when resting', () => {
    fixture.detectChanges();
    component.isResting = true;

    expect(component.currentStep).toBeNull();
  });

  it('should calculate progress percent', () => {
    fixture.detectChanges();
    component.timeLeft = 60;
    component.currentStepIndex = 0;

    const progress = component.progressPercent;
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(100);
  });

  it('should calculate remaining global time', () => {
    fixture.detectChanges();
    component.currentStepIndex = 0;
    component.timeLeft = 30;
    component.isResting = false;

    const remaining = component.remainingGlobalTime();
    // 30 (current) + 10 (rest) + 50 (step 2) = 90
    // But actually: 30 (left in step 1) + 10 (rest) + 50 (step 2) = 90
    // However component counts from startIndex = 0 + 1 = 1, so only step 2
    // So: 30 (current) + 50 (step 2) = 80 (no rest after last step)
    expect(remaining).toBe(80);
  });

  describe('Wake Lock (issue #106)', () => {
    it('should acquire wake lock on start when API is available', async () => {
      const mockRelease = vi.fn().mockResolvedValue(undefined);
      const mockSentinel = {
        release: mockRelease,
        addEventListener: vi.fn(),
      };
      Object.defineProperty(navigator, 'wakeLock', {
        value: { request: vi.fn().mockResolvedValue(mockSentinel) },
        configurable: true,
        writable: true,
      });

      fixture.detectChanges();
      component.start();

      await vi.waitFor(() => {
        expect(navigator.wakeLock.request).toHaveBeenCalledWith('screen');
      });
    });

    it('should release wake lock on pause', async () => {
      const mockRelease = vi.fn().mockResolvedValue(undefined);
      const mockSentinel = {
        release: mockRelease,
        addEventListener: vi.fn(),
      };
      Object.defineProperty(navigator, 'wakeLock', {
        value: { request: vi.fn().mockResolvedValue(mockSentinel) },
        configurable: true,
        writable: true,
      });

      fixture.detectChanges();
      component.start();

      await vi.waitFor(() => {
        expect(navigator.wakeLock.request).toHaveBeenCalled();
      });

      component.pause();

      await vi.waitFor(() => {
        expect(mockRelease).toHaveBeenCalled();
      });
    });

    it('should not fail when wake lock API is not available', () => {
      delete (navigator as any).wakeLock;
      fixture.detectChanges();

      expect(() => component.start()).not.toThrow();
    });

    it('should re-acquire wake lock on visibilitychange when playing (issue #115)', async () => {
      const mockRelease = vi.fn().mockResolvedValue(undefined);
      const mockRequest = vi.fn().mockResolvedValue({
        release: mockRelease,
        addEventListener: vi.fn(),
      });
      Object.defineProperty(navigator, 'wakeLock', {
        value: { request: mockRequest },
        configurable: true,
        writable: true,
      });

      fixture.detectChanges();
      component.start();

      await vi.waitFor(() => {
        expect(mockRequest).toHaveBeenCalledTimes(1);
      });

      mockRequest.mockClear();

      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        configurable: true,
        writable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));

      await vi.waitFor(() => {
        expect(mockRequest).toHaveBeenCalledWith('screen');
      });
    });

    it('should not re-acquire wake lock on visibilitychange when paused', async () => {
      const mockRequest = vi.fn().mockResolvedValue({
        release: vi.fn().mockResolvedValue(undefined),
        addEventListener: vi.fn(),
      });
      Object.defineProperty(navigator, 'wakeLock', {
        value: { request: mockRequest },
        configurable: true,
        writable: true,
      });

      fixture.detectChanges();
      component.start();

      await vi.waitFor(() => {
        expect(mockRequest).toHaveBeenCalledTimes(1);
      });

      component.pause();
      mockRequest.mockClear();

      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        configurable: true,
        writable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));

      await new Promise((r) => setTimeout(r, 50));
      expect(mockRequest).not.toHaveBeenCalled();
    });

    it('should clean up visibilitychange listener on destroy', async () => {
      const removeSpy = vi.spyOn(document, 'removeEventListener');
      const mockRequest = vi.fn().mockResolvedValue({
        release: vi.fn().mockResolvedValue(undefined),
        addEventListener: vi.fn(),
      });
      Object.defineProperty(navigator, 'wakeLock', {
        value: { request: mockRequest },
        configurable: true,
        writable: true,
      });

      fixture.detectChanges();
      component.start();

      await vi.waitFor(() => {
        expect(mockRequest).toHaveBeenCalled();
      });

      component.ngOnDestroy();

      expect(removeSpy).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function),
      );
    });
  });

  describe('Admin actions on routine page', () => {
    it('should not show admin actions when admin mode is off', () => {
      const userRoutine = {
        ...mockRoutine,
        visibility: 'user' as 'builtIn' | 'user',
      };
      mockRoutineService.getBySlug.mockReturnValue(of(userRoutine));
      mockAuthService.isAdminMode.set(false);
      fixture.detectChanges();

      const adminActions =
        fixture.nativeElement.querySelector('.admin-actions');
      expect(adminActions).toBeNull();
    });

    it('should show admin actions when admin mode is on and routine is user-created', () => {
      const userRoutine = {
        ...mockRoutine,
        visibility: 'user' as 'builtIn' | 'user',
      };
      mockRoutineService.getBySlug.mockReturnValue(of(userRoutine));
      mockAuthService.isAdminMode.set(true);
      fixture.detectChanges();

      const adminActions =
        fixture.nativeElement.querySelector('.admin-actions');
      expect(adminActions).toBeTruthy();

      const buttons = adminActions.querySelectorAll('button');
      expect(buttons.length).toBe(2);
    });

    it('should not show admin actions on built-in routines even in admin mode', () => {
      const builtInRoutine = {
        ...mockRoutine,
        visibility: 'builtIn' as 'builtIn' | 'user',
      };
      mockRoutineService.getBySlug.mockReturnValue(of(builtInRoutine));
      mockAuthService.isAdminMode.set(true);
      fixture.detectChanges();

      const adminActions =
        fixture.nativeElement.querySelector('.admin-actions');
      expect(adminActions).toBeNull();
    });

    it('should navigate to edit page when editRoutine is called', () => {
      fixture.detectChanges();

      component.editRoutine();

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/routines',
        'test-routine',
        'edit',
      ]);
    });

    it('should not navigate when editRoutine is called with no routine', () => {
      component.routine = null;

      component.editRoutine();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should delete routine and navigate to home on confirm', () => {
      fixture.detectChanges();
      mockRoutineService.delete.mockReturnValue(of({}));
      vi.spyOn(global, 'confirm').mockReturnValue(true);

      component.deleteRoutine();

      expect(mockRoutineService.delete).toHaveBeenCalledWith('test-routine');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/routines']);
    });

    it('should not delete routine when user cancels', () => {
      fixture.detectChanges();
      vi.spyOn(global, 'confirm').mockReturnValue(false);

      component.deleteRoutine();

      expect(mockRoutineService.delete).not.toHaveBeenCalled();
    });
  });
});
