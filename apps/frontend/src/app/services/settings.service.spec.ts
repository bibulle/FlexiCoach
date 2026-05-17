import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { SettingsService } from './settings.service';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('SettingsService', () => {
  let service: SettingsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SettingsService],
    });
    service = TestBed.inject(SettingsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('load', () => {
    it('should fetch user and apply backend settings to localStorage', () => {
      const mockUser = {
        _id: 'user-1',
        settings: {
          theme: 'dark',
          voiceRate: 1.5,
          voiceVolume: 0.8,
          sound: false,
          reminders: [{ time: '09:00', days: [0, 1], enabled: true }],
        },
      };

      service.load().subscribe();

      const req = httpMock.expectOne('/api/users/me');
      req.flush(mockUser);

      expect(localStorage.getItem('theme')).toBe('dark');
      expect(localStorage.getItem('reminders')).toBe(
        JSON.stringify(mockUser.settings.reminders),
      );
      const voice = JSON.parse(localStorage.getItem('voiceSettings')!);
      expect(voice.speed).toBe(1.5);
      expect(voice.volume).toBe(0.8);
      expect(voice.bips).toBe(false);
    });

    it('should migrate localStorage to backend when backend settings are empty', () => {
      localStorage.setItem('theme', 'dark');
      localStorage.setItem(
        'voiceSettings',
        JSON.stringify({ speed: 1.2, volume: 0.5, bips: true }),
      );
      localStorage.setItem(
        'reminders',
        JSON.stringify([{ time: '08:00', days: [0, 1], enabled: true }]),
      );

      service.load().subscribe();

      const getReq = httpMock.expectOne('/api/users/me');
      getReq.flush({ _id: 'user-1', settings: {} });

      const patchReq = httpMock.expectOne('/api/users/me/settings');
      expect(patchReq.request.method).toBe('PATCH');
      expect(patchReq.request.body.theme).toBe('dark');
      expect(patchReq.request.body.voiceRate).toBe(1.2);
      expect(patchReq.request.body.voiceVolume).toBe(0.5);
      expect(patchReq.request.body.sound).toBe(true);
      expect(patchReq.request.body.reminders).toEqual([
        { time: '08:00', days: [0, 1], enabled: true },
      ]);
      patchReq.flush({ settings: patchReq.request.body });
    });

    it('should not migrate when both backend and localStorage are empty', () => {
      service.load().subscribe();

      const req = httpMock.expectOne('/api/users/me');
      req.flush({ _id: 'user-1', settings: {} });

      httpMock.expectNone('/api/users/me/settings');
    });

    it('should not crash when server returns error', () => {
      let result: any;
      service.load().subscribe((r) => (result = r));

      const req = httpMock.expectOne('/api/users/me');
      req.flush('error', { status: 500, statusText: 'Server Error' });

      expect(result).toBeNull();
    });

    it('should migrate localStorage when backend has no settings property', () => {
      localStorage.setItem('theme', 'light');

      service.load().subscribe();

      const req = httpMock.expectOne('/api/users/me');
      req.flush({ _id: 'user-1' });

      const patchReq = httpMock.expectOne('/api/users/me/settings');
      expect(patchReq.request.body.theme).toBe('light');
      patchReq.flush({ settings: patchReq.request.body });
    });
  });

  describe('save', () => {
    it('should PATCH settings to backend', () => {
      const settings = { theme: 'dark' as const, voiceRate: 1.2 };

      service.save(settings).subscribe();

      const req = httpMock.expectOne('/api/users/me/settings');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(settings);
      req.flush({ settings });
    });

    it('should not throw on server error', () => {
      let result: any;
      service.save({ theme: 'dark' }).subscribe((r) => (result = r));

      const req = httpMock.expectOne('/api/users/me/settings');
      req.flush('error', { status: 500, statusText: 'Server Error' });

      expect(result).toBeNull();
    });
  });
});
