import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { StatsService, StatsSummary } from './stats.service';
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
      };

      const responsePromise = firstValueFrom(service.getSummary());

      const req = httpMock.expectOne('/api/sessions/stats/summary');
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
      };

      const responsePromise = firstValueFrom(service.getSummary(userId));

      const req = httpMock.expectOne(
        '/api/sessions/stats/summary?userId=user123',
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
      };

      const responsePromise = firstValueFrom(service.getSummary());

      const req = httpMock.expectOne('/api/sessions/stats/summary');
      expect(req.request.method).toBe('GET');
      req.flush(mockSummary);

      const summary = await responsePromise;
      expect(summary).toEqual(mockSummary);
      expect(summary.favoriteRoutine).toBeNull();
    });
  });
});
