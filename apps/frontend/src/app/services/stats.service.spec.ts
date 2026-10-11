import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { StatsService, StatsSummary, browserTimeZone } from './stats.service';
import { vi } from 'vitest';
import { firstValueFrom } from 'rxjs';

describe('StatsService', () => {
  let service: StatsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StatsService],
    });

    service = TestBed.inject(StatsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSummary', () => {
    it('should make GET request to /api/sessions/stats/summary without userId', async () => {
      const mockSummary: StatsSummary = {
        currentStreak: 5,
        longestStreak: 12,
        totalSessions: 50,
        totalMinutes: 2500,
        adherenceRate: 0.85,
        favoriteRoutine: 'Morning Stretch',
        recentSessions: 12,
        weekdayActivity: [3, 2, 2, 1, 2, 1, 1],
        topRoutines: [
          { routineId: 'morning', name: 'Morning Stretch', count: 8 },
        ],
      };

      const responsePromise = firstValueFrom(service.getSummary());

      const req = httpMock.expectOne(
        (r) => r.url === '/api/sessions/stats/summary',
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.has('userId')).toBe(false);
      req.flush(mockSummary);

      const summary = await responsePromise;
      expect(summary).toEqual(mockSummary);
      expect(summary.currentStreak).toBe(5);
      expect(summary.longestStreak).toBe(12);
      expect(summary.totalSessions).toBe(50);
      expect(summary.totalMinutes).toBe(2500);
      expect(summary.adherenceRate).toBe(0.85);
      expect(summary.favoriteRoutine).toBe('Morning Stretch');
    });

    it('should make GET request to /api/sessions/stats/summary with userId param', async () => {
      const userId = 'user123';
      const mockSummary: StatsSummary = {
        currentStreak: 3,
        longestStreak: 8,
        totalSessions: 25,
        totalMinutes: 1200,
        adherenceRate: 0.75,
        favoriteRoutine: 'Evening Yoga',
        recentSessions: 4,
        weekdayActivity: [1, 0, 1, 0, 1, 0, 1],
        topRoutines: [{ routineId: 'yoga', name: 'Evening Yoga', count: 4 }],
      };

      const responsePromise = firstValueFrom(service.getSummary(userId));

      const req = httpMock.expectOne(
        (r) => r.url === '/api/sessions/stats/summary',
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('userId')).toBe(userId);
      req.flush(mockSummary);

      const summary = await responsePromise;
      expect(summary).toEqual(mockSummary);
      expect(summary.currentStreak).toBe(3);
      expect(summary.favoriteRoutine).toBe('Evening Yoga');
    });

    it('should handle summary with null favoriteRoutine', async () => {
      const mockSummary: StatsSummary = {
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

      const responsePromise = firstValueFrom(service.getSummary());

      const req = httpMock.expectOne(
        (r) => r.url === '/api/sessions/stats/summary',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockSummary);

      const summary = await responsePromise;
      expect(summary).toEqual(mockSummary);
      expect(summary.favoriteRoutine).toBeNull();
    });

    it("should send the browser's time zone (issue #148)", () => {
      vi.spyOn(
        Intl.DateTimeFormat.prototype,
        'resolvedOptions',
      ).mockReturnValue({
        timeZone: 'Europe/Paris',
      } as Intl.ResolvedDateTimeFormatOptions);
      try {
        service.getSummary().subscribe();

        const req = httpMock.expectOne(
          (r) => r.url === '/api/sessions/stats/summary',
        );
        expect(req.request.params.get('tz')).toBe('Europe/Paris');
        expect(req.request.urlWithParams).toBe(
          '/api/sessions/stats/summary?tz=Europe/Paris',
        );
        req.flush({});
      } finally {
        vi.restoreAllMocks();
      }
    });

    it('should not send a time zone when the browser exposes none', () => {
      vi.spyOn(
        Intl.DateTimeFormat.prototype,
        'resolvedOptions',
      ).mockReturnValue({} as Intl.ResolvedDateTimeFormatOptions);
      try {
        expect(browserTimeZone()).toBeUndefined();
        service.getSummary().subscribe();

        const req = httpMock.expectOne(
          (r) => r.url === '/api/sessions/stats/summary',
        );
        expect(req.request.params.has('tz')).toBe(false);
        req.flush({});
      } finally {
        vi.restoreAllMocks();
      }
    });

    it('should not fail when the time zone cannot be read', () => {
      vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => {
        throw new Error('Intl unavailable');
      });
      try {
        expect(browserTimeZone()).toBeUndefined();
      } finally {
        vi.restoreAllMocks();
      }
    });
  });
});
