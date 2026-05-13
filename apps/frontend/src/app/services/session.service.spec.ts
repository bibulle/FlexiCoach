import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { SessionService } from './session.service';
import { Session } from '@flexicoach/shared';
import { firstValueFrom } from 'rxjs';

describe('SessionService', () => {
  let service: SessionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SessionService],
    });

    service = TestBed.inject(SessionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should make GET request to /api/sessions without userId', async () => {
      const mockSessions: Session[] = [
        {
          _id: '1',
          userId: 'user1',
          routineId: 'routine1',
          startAt: new Date(),
          completed: false,
        } as Session,
        {
          _id: '2',
          userId: 'user2',
          routineId: 'routine2',
          startAt: new Date(),
          completed: true,
        } as Session,
      ];

      const responsePromise = firstValueFrom(service.getAll());

      const req = httpMock.expectOne('/api/sessions');
      expect(req.request.method).toBe('GET');
      req.flush(mockSessions);

      const sessions = await responsePromise;
      expect(sessions).toEqual(mockSessions);
      expect(sessions.length).toBe(2);
    });

    it('should make GET request to /api/sessions with userId query param', async () => {
      const userId = 'user123';
      const mockSessions: Session[] = [
        {
          _id: '1',
          userId: userId,
          routineId: 'routine1',
          startAt: new Date(),
          completed: false,
        } as Session,
      ];

      const responsePromise = firstValueFrom(service.getAll(userId));

      const req = httpMock.expectOne('/api/sessions?userId=user123');
      expect(req.request.method).toBe('GET');
      req.flush(mockSessions);

      const sessions = await responsePromise;
      expect(sessions).toEqual(mockSessions);
      expect(sessions.length).toBe(1);
    });
  });

  describe('getById', () => {
    it('should make GET request to /api/sessions/:id', async () => {
      const mockSession: Session = {
        _id: '123',
        userId: 'user1',
        routineId: 'routine1',
        startAt: new Date(),
        completed: false,
      } as Session;

      const responsePromise = firstValueFrom(service.getById('123'));

      const req = httpMock.expectOne('/api/sessions/123');
      expect(req.request.method).toBe('GET');
      req.flush(mockSession);

      const session = await responsePromise;
      expect(session).toEqual(mockSession);
      expect(session._id).toBe('123');
    });
  });

  describe('getStats', () => {
    it('should make GET request to /api/sessions/stats without userId', async () => {
      const mockStats = {
        totalSessions: 10,
        completedSessions: 8,
        totalMinutes: 450,
      };

      const responsePromise = firstValueFrom(service.getStats());

      const req = httpMock.expectOne('/api/sessions/stats');
      expect(req.request.method).toBe('GET');
      req.flush(mockStats);

      const stats = await responsePromise;
      expect(stats).toEqual(mockStats);
      expect(stats.totalSessions).toBe(10);
      expect(stats.completedSessions).toBe(8);
    });

    it('should make GET request to /api/sessions/stats with userId query param', async () => {
      const userId = 'user123';
      const mockStats = {
        totalSessions: 5,
        completedSessions: 4,
        totalMinutes: 200,
      };

      const responsePromise = firstValueFrom(service.getStats(userId));

      const req = httpMock.expectOne('/api/sessions/stats?userId=user123');
      expect(req.request.method).toBe('GET');
      req.flush(mockStats);

      const stats = await responsePromise;
      expect(stats).toEqual(mockStats);
      expect(stats.totalSessions).toBe(5);
    });
  });

  describe('create', () => {
    it('should make POST request to /api/sessions', async () => {
      const newSession: Partial<Session> = {
        userId: 'user1',
        routineId: 'routine1',
        startAt: new Date(),
        completed: false,
      };

      const mockResponse: Session = {
        _id: '456',
        ...newSession,
      } as Session;

      const responsePromise = firstValueFrom(service.create(newSession));

      const req = httpMock.expectOne('/api/sessions');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newSession);
      req.flush(mockResponse);

      const session = await responsePromise;
      expect(session).toEqual(mockResponse);
      expect(session._id).toBe('456');
    });
  });

  describe('update', () => {
    it('should make PATCH request to /api/sessions/:id', async () => {
      const sessionId = '123';
      const updateData: Partial<Session> = {
        completed: true,
        endAt: new Date(),
      };

      const mockResponse: Session = {
        _id: sessionId,
        userId: 'user1',
        routineId: 'routine1',
        startAt: new Date(),
        ...updateData,
      } as Session;

      const responsePromise = firstValueFrom(
        service.update(sessionId, updateData),
      );

      const req = httpMock.expectOne('/api/sessions/123');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockResponse);

      const session = await responsePromise;
      expect(session).toEqual(mockResponse);
      expect(session.completed).toBe(true);
    });
  });

  describe('complete', () => {
    it('should make PATCH request to /api/sessions/:id/complete with completed flag', async () => {
      const sessionId = '123';
      const mockResponse: Session = {
        _id: sessionId,
        userId: 'user1',
        routineId: 'routine1',
        startAt: new Date(),
        completed: true,
        endAt: new Date(),
      } as Session;

      const responsePromise = firstValueFrom(service.complete(sessionId, true));

      const req = httpMock.expectOne('/api/sessions/123/complete');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ completed: true, feeling: undefined });
      req.flush(mockResponse);

      const session = await responsePromise;
      expect(session).toEqual(mockResponse);
      expect(session.completed).toBe(true);
    });

    it('should make PATCH request to /api/sessions/:id/complete with feeling', async () => {
      const sessionId = '123';
      const mockResponse: Session = {
        _id: sessionId,
        userId: 'user1',
        routineId: 'routine1',
        startAt: new Date(),
        completed: true,
        feeling: 5,
        endAt: new Date(),
      } as Session;

      const responsePromise = firstValueFrom(
        service.complete(sessionId, true, 5),
      );

      const req = httpMock.expectOne('/api/sessions/123/complete');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ completed: true, feeling: 5 });
      req.flush(mockResponse);

      const session = await responsePromise;
      expect(session).toEqual(mockResponse);
      expect(session.completed).toBe(true);
      expect(session.feeling).toBe(5);
    });
  });
});
