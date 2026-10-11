import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SessionsService } from './sessions.service';
import { Session } from '../schemas/session.schema';
import { Routine } from '../schemas/routine.schema';

describe('SessionsService', () => {
  let service: SessionsService;
  let mockSessionModel: any;
  let mockRoutineModel: any;

  const mockSession = {
    _id: 'session-mongo-id',
    userId: 'user-123',
    routineId: 'routine-123',
    startAt: new Date('2024-01-15T10:00:00Z'),
    endAt: null,
    durationSec: 600,
    completed: false,
    feeling: null,
  };

  beforeEach(async () => {
    // Create mock functions
    const mockExec = jest.fn();
    const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
    const mockFind = jest
      .fn()
      .mockReturnValue({ exec: mockExec, sort: mockSort });
    const mockFindById = jest.fn().mockReturnValue({ exec: mockExec });
    const mockFindByIdAndUpdate = jest.fn().mockReturnValue({ exec: mockExec });

    // Create a mock model constructor
    mockSessionModel = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: 'new-session-id',
      save: jest.fn().mockResolvedValue({
        ...mockSession,
        ...data,
        _id: 'new-session-id',
      }),
    }));
    mockSessionModel.find = mockFind;
    mockSessionModel.findById = mockFindById;
    mockSessionModel.findByIdAndUpdate = mockFindByIdAndUpdate;

    // Create mock routine model
    const mockRoutineExec = jest.fn().mockResolvedValue(null);
    const mockRoutineFindOne = jest
      .fn()
      .mockReturnValue({ exec: mockRoutineExec });
    mockRoutineModel = {
      findOne: mockRoutineFindOne,
      find: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: getModelToken(Session.name),
          useValue: mockSessionModel,
        },
        {
          provide: getModelToken(Routine.name),
          useValue: mockRoutineModel,
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a session', async () => {
      const sessionData = {
        userId: 'user1',
        routineId: 'routine1',
        startAt: new Date(),
        durationSec: 600,
        completed: false,
      };

      const result = await service.create(sessionData as any);

      expect(result).toBeDefined();
      expect(result.userId).toBe('user1');
      expect(result.routineId).toBe('routine1');
      expect(result.completed).toBe(false);
      expect(mockSessionModel).toHaveBeenCalledWith(sessionData);
    });
  });

  describe('findAll', () => {
    it('should return all sessions', async () => {
      const mockSessions = [
        { ...mockSession, userId: 'user1' },
        { ...mockSession, userId: 'user2' },
      ];
      mockSessionModel.find().sort().exec.mockResolvedValue(mockSessions);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(mockSessionModel.find).toHaveBeenCalledWith({});
    });

    it('should filter by userId', async () => {
      const mockSessions = [{ ...mockSession, userId: 'user1' }];
      mockSessionModel.find().sort().exec.mockResolvedValue(mockSessions);

      const result = await service.findAll('user1');

      expect(result).toHaveLength(1);
      expect(mockSessionModel.find).toHaveBeenCalledWith({ userId: 'user1' });
    });

    it('should sort sessions by startAt descending', async () => {
      mockSessionModel.find().sort().exec.mockResolvedValue([]);

      await service.findAll();

      expect(mockSessionModel.find().sort).toHaveBeenCalledWith({
        startAt: -1,
      });
    });
  });

  describe('findOne', () => {
    it('should find session by id', async () => {
      mockSessionModel.findById().exec.mockResolvedValue(mockSession);

      const result = await service.findOne('session-mongo-id');

      expect(result).toBeDefined();
      expect(mockSessionModel.findById).toHaveBeenCalledWith(
        'session-mongo-id',
      );
    });

    it('should return null for non-existent id', async () => {
      mockSessionModel.findById().exec.mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update session', async () => {
      const updatedSession = { ...mockSession, completed: true };
      mockSessionModel
        .findByIdAndUpdate()
        .exec.mockResolvedValue(updatedSession);

      const result = await service.update('session-mongo-id', {
        completed: true,
      });

      expect(result).toBeDefined();
      expect(result?.completed).toBe(true);
      expect(mockSessionModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'session-mongo-id',
        { completed: true },
        { new: true },
      );
    });

    it('should return null for non-existent id', async () => {
      mockSessionModel.findByIdAndUpdate().exec.mockResolvedValue(null);

      const result = await service.update('non-existent-id', {
        completed: true,
      });

      expect(result).toBeNull();
    });
  });

  describe('complete', () => {
    it('should mark session as completed with endAt', async () => {
      const completedSession = {
        ...mockSession,
        completed: true,
        endAt: new Date(),
      };
      mockSessionModel
        .findByIdAndUpdate()
        .exec.mockResolvedValue(completedSession);

      const result = await service.complete('session-mongo-id', true);

      expect(result).toBeDefined();
      expect(result?.completed).toBe(true);
      expect(result?.endAt).toBeDefined();
      expect(mockSessionModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'session-mongo-id',
        expect.objectContaining({
          completed: true,
          endAt: expect.any(Date),
        }),
        { new: true },
      );
    });

    it('should mark session with feeling', async () => {
      const completedSession = { ...mockSession, completed: true, feeling: 5 };
      mockSessionModel
        .findByIdAndUpdate()
        .exec.mockResolvedValue(completedSession);

      const result = await service.complete('session-mongo-id', true, 5);

      expect(result).toBeDefined();
      expect(result?.completed).toBe(true);
      expect(result?.feeling).toBe(5);
    });

    it('should mark session as incomplete', async () => {
      const incompleteSession = { ...mockSession, completed: false };
      mockSessionModel
        .findByIdAndUpdate()
        .exec.mockResolvedValue(incompleteSession);

      const result = await service.complete('session-mongo-id', false);

      expect(result?.completed).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should calculate stats correctly', async () => {
      const mockSessions = [
        { ...mockSession, durationSec: 600, completed: true },
        { ...mockSession, durationSec: 300, completed: false },
        { ...mockSession, durationSec: 900, completed: true },
      ];
      mockSessionModel.find().exec.mockResolvedValue(mockSessions);

      const result = await service.getStats('user1');

      expect(result.totalSessions).toBe(3);
      expect(result.completedSessions).toBe(2);
      expect(result.totalMinutes).toBe(30); // (600 + 300 + 900) / 60 = 30
    });

    it('should return zero stats when no sessions', async () => {
      mockSessionModel.find().exec.mockResolvedValue([]);

      const result = await service.getStats('user1');

      expect(result.totalSessions).toBe(0);
      expect(result.completedSessions).toBe(0);
      expect(result.totalMinutes).toBe(0);
    });

    it('should filter by userId', async () => {
      mockSessionModel.find().exec.mockResolvedValue([]);

      await service.getStats('user1');

      expect(mockSessionModel.find).toHaveBeenCalledWith({ userId: 'user1' });
    });

    it('should return stats for all users when no userId provided', async () => {
      mockSessionModel.find().exec.mockResolvedValue([]);

      await service.getStats();

      expect(mockSessionModel.find).toHaveBeenCalledWith({});
    });
  });

  describe('getCalendar', () => {
    it('should group sessions by date', async () => {
      const mockSessions = [
        {
          ...mockSession,
          startAt: new Date('2024-01-01T10:00:00Z'),
          completed: true,
        },
        {
          ...mockSession,
          startAt: new Date('2024-01-01T14:00:00Z'),
          completed: true,
        },
        {
          ...mockSession,
          startAt: new Date('2024-01-02T10:00:00Z'),
          completed: false,
        },
      ];
      mockSessionModel.find().exec.mockResolvedValue(mockSessions);

      const result = await service.getCalendar('user1');

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2024-01-01');
      expect(result[0].completionRate).toBe(100); // 2/2 completed
      expect(result[1].date).toBe('2024-01-02');
      expect(result[1].completionRate).toBe(0); // 0/1 completed
    });

    it('should filter by date range', async () => {
      mockSessionModel.find().exec.mockResolvedValue([]);

      await service.getCalendar('user1', '2024-01-01', '2024-01-31');

      expect(mockSessionModel.find).toHaveBeenCalledWith({
        userId: 'user1',
        startAt: {
          $gte: new Date('2024-01-01'),
          $lte: new Date('2024-01-31'),
        },
      });
    });

    it('should sort calendar by date ascending', async () => {
      const mockSessions = [
        {
          ...mockSession,
          startAt: new Date('2024-01-03T10:00:00Z'),
          completed: true,
        },
        {
          ...mockSession,
          startAt: new Date('2024-01-01T10:00:00Z'),
          completed: true,
        },
        {
          ...mockSession,
          startAt: new Date('2024-01-02T10:00:00Z'),
          completed: true,
        },
      ];
      mockSessionModel.find().exec.mockResolvedValue(mockSessions);

      const result = await service.getCalendar('user1');

      expect(result).toHaveLength(3);
      expect(result[0].date).toBe('2024-01-01');
      expect(result[1].date).toBe('2024-01-02');
      expect(result[2].date).toBe('2024-01-03');
    });

    it('should handle partial date range (only from)', async () => {
      mockSessionModel.find().exec.mockResolvedValue([]);

      await service.getCalendar('user1', '2024-01-01');

      expect(mockSessionModel.find).toHaveBeenCalledWith({
        userId: 'user1',
        startAt: {
          $gte: new Date('2024-01-01'),
        },
      });
    });

    it('should handle partial date range (only to)', async () => {
      mockSessionModel.find().exec.mockResolvedValue([]);

      await service.getCalendar('user1', undefined, '2024-01-31');

      expect(mockSessionModel.find).toHaveBeenCalledWith({
        userId: 'user1',
        startAt: {
          $lte: new Date('2024-01-31'),
        },
      });
    });
  });

  describe('getSummary', () => {
    it('should calculate current streak when sessions today', async () => {
      const today = new Date();
      const yesterday = new Date(Date.now() - 86400000);
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000);

      const mockSessions = [
        { ...mockSession, startAt: today, completed: true, durationSec: 600 },
        {
          ...mockSession,
          startAt: yesterday,
          completed: true,
          durationSec: 600,
        },
        {
          ...mockSession,
          startAt: twoDaysAgo,
          completed: true,
          durationSec: 600,
        },
      ];
      mockSessionModel.find().exec.mockResolvedValue(mockSessions);

      const result = await service.getSummary('user1');

      expect(result.currentStreak).toBe(3);
    });

    it('should calculate current streak when sessions yesterday but not today', async () => {
      const yesterday = new Date(Date.now() - 86400000);
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000);

      const mockSessions = [
        {
          ...mockSession,
          startAt: yesterday,
          completed: true,
          durationSec: 600,
        },
        {
          ...mockSession,
          startAt: twoDaysAgo,
          completed: true,
          durationSec: 600,
        },
      ];
      mockSessionModel.find().exec.mockResolvedValue(mockSessions);

      const result = await service.getSummary('user1');

      expect(result.currentStreak).toBe(2);
    });

    it('should have zero current streak when no recent sessions', async () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000);

      const mockSessions = [
        {
          ...mockSession,
          startAt: threeDaysAgo,
          completed: true,
          durationSec: 600,
        },
      ];
      mockSessionModel.find().exec.mockResolvedValue(mockSessions);

      const result = await service.getSummary('user1');

      expect(result.currentStreak).toBe(0);
    });

    it('should calculate longest streak correctly', async () => {
      // Create a streak of 5 days, then a gap, then 3 days
      const mockSessions = [
        { ...mockSession, startAt: new Date('2024-01-01'), durationSec: 600 },
        { ...mockSession, startAt: new Date('2024-01-02'), durationSec: 600 },
        { ...mockSession, startAt: new Date('2024-01-03'), durationSec: 600 },
        { ...mockSession, startAt: new Date('2024-01-04'), durationSec: 600 },
        { ...mockSession, startAt: new Date('2024-01-05'), durationSec: 600 },
        { ...mockSession, startAt: new Date('2024-01-10'), durationSec: 600 },
        { ...mockSession, startAt: new Date('2024-01-11'), durationSec: 600 },
        { ...mockSession, startAt: new Date('2024-01-12'), durationSec: 600 },
      ];
      mockSessionModel.find().exec.mockResolvedValue(mockSessions);

      const result = await service.getSummary('user1');

      expect(result.longestStreak).toBe(5);
    });

    it('should find favorite routine and resolve its name', async () => {
      const mockSessions = [
        {
          ...mockSession,
          startAt: new Date(),
          routineId: 'routine1',
          durationSec: 600,
        },
        {
          ...mockSession,
          startAt: new Date(),
          routineId: 'routine1',
          durationSec: 600,
        },
        {
          ...mockSession,
          startAt: new Date(),
          routineId: 'routine2',
          durationSec: 600,
        },
      ];
      mockSessionModel.find().exec.mockResolvedValue(mockSessions);
      mockRoutineModel.findOne.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ id: 'routine1', name: 'Douce 10 min' }),
      });

      const result = await service.getSummary('user1');

      expect(result.favoriteRoutine).toBe('Douce 10 min');
      expect(mockRoutineModel.findOne).toHaveBeenCalledWith({ id: 'routine1' });
    });

    it('should fallback to routine ID when routine not found in database', async () => {
      const mockSessions = [
        {
          ...mockSession,
          startAt: new Date(),
          routineId: 'deleted-routine',
          durationSec: 600,
        },
      ];
      mockSessionModel.find().exec.mockResolvedValue(mockSessions);
      mockRoutineModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.getSummary('user1');

      expect(result.favoriteRoutine).toBe('deleted-routine');
    });

    it('should return null for favoriteRoutine when no sessions', async () => {
      mockSessionModel.find().exec.mockResolvedValue([]);

      const result = await service.getSummary('user1');

      expect(result.favoriteRoutine).toBeNull();
    });

    it('should calculate adherence rate correctly', async () => {
      // Create sessions on 15 different days in last 30 days
      const today = new Date();
      const mockSessions = [];
      for (let i = 0; i < 15; i++) {
        const date = new Date(today.getTime() - i * 86400000);
        mockSessions.push({ ...mockSession, startAt: date, durationSec: 600 });
      }
      mockSessionModel.find().exec.mockResolvedValue(mockSessions);

      const result = await service.getSummary('user1');

      expect(result.adherenceRate).toBe(50); // 15/30 = 50%
    });

    it('should calculate total sessions and minutes', async () => {
      const mockSessions = [
        { ...mockSession, startAt: new Date(), durationSec: 600 },
        { ...mockSession, startAt: new Date(), durationSec: 1200 },
      ];
      mockSessionModel.find().exec.mockResolvedValue(mockSessions);

      const result = await service.getSummary('user1');

      expect(result.totalSessions).toBe(2);
      expect(result.totalMinutes).toBe(30); // (600 + 1200) / 60 = 30
    });

    it('should return zero values when no sessions', async () => {
      mockSessionModel.find().exec.mockResolvedValue([]);

      const result = await service.getSummary('user1');

      expect(result.currentStreak).toBe(0);
      expect(result.longestStreak).toBe(0);
      expect(result.totalSessions).toBe(0);
      expect(result.totalMinutes).toBe(0);
      expect(result.adherenceRate).toBe(0);
      expect(result.favoriteRoutine).toBeNull();
    });
  });

  describe('getSummary - recent activity (issue #148)', () => {
    const DAY = 86400000;
    const daysAgo = (days: number) => new Date(Date.now() - days * DAY);
    const session = (startAt: Date, routineId = 'routine1') => ({
      ...mockSession,
      startAt,
      routineId,
      completed: true,
    });
    const mockRoutines = (routines: Array<{ id: string; name: string }>) =>
      mockRoutineModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(routines),
      });

    it('should return an empty activity for a user without sessions', async () => {
      mockSessionModel.find().exec.mockResolvedValue([]);

      const result = await service.getSummary('user1');

      expect(result.recentSessions).toBe(0);
      expect(result.weekdayActivity).toEqual([0, 0, 0, 0, 0, 0, 0]);
      expect(result.topRoutines).toEqual([]);
      // No routine to look up
      expect(mockRoutineModel.find).not.toHaveBeenCalled();
    });

    it('should count the sessions of each weekday, Monday first', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2024-01-31T12:00:00Z'));
      try {
        mockSessionModel.find().exec.mockResolvedValue([
          session(new Date('2024-01-29T08:00:00Z')), // Monday
          session(new Date('2024-01-22T18:00:00Z')), // Monday
          session(new Date('2024-01-24T07:00:00Z')), // Wednesday
          session(new Date('2024-01-28T10:00:00Z')), // Sunday
        ]);

        const result = await service.getSummary('user1');

        expect(result.weekdayActivity).toEqual([2, 0, 1, 0, 0, 0, 1]);
        expect(result.recentSessions).toBe(4);
      } finally {
        jest.useRealTimers();
      }
    });

    it('should ignore sessions older than 30 days', async () => {
      mockSessionModel
        .find()
        .exec.mockResolvedValue([
          session(daysAgo(1), 'recent'),
          session(daysAgo(29), 'recent'),
          session(daysAgo(31), 'old'),
          session(daysAgo(200), 'old'),
        ]);
      mockRoutines([{ id: 'recent', name: 'Récente' }]);

      const result = await service.getSummary('user1');

      expect(result.recentSessions).toBe(2);
      expect(result.weekdayActivity.reduce((a, b) => a + b, 0)).toBe(2);
      expect(result.topRoutines).toEqual([
        { routineId: 'recent', name: 'Récente', count: 2 },
      ]);
      // The all-time figures still include the old sessions
      expect(result.totalSessions).toBe(4);
    });

    it("should use the client's time zone to pick the weekday", async () => {
      jest.useFakeTimers().setSystemTime(new Date('2024-01-31T12:00:00Z'));
      try {
        // Sunday 23:30 UTC = Monday 00:30 in Paris = Sunday 18:30 in New York
        mockSessionModel
          .find()
          .exec.mockResolvedValue([session(new Date('2024-01-28T23:30:00Z'))]);

        const utc = await service.getSummary('user1');
        const paris = await service.getSummary('user1', 'Europe/Paris');
        const newYork = await service.getSummary('user1', 'America/New_York');

        expect(utc.weekdayActivity).toEqual([0, 0, 0, 0, 0, 0, 1]);
        expect(paris.weekdayActivity).toEqual([1, 0, 0, 0, 0, 0, 0]);
        expect(newYork.weekdayActivity).toEqual([0, 0, 0, 0, 0, 0, 1]);
      } finally {
        jest.useRealTimers();
      }
    });

    it('should fall back to UTC for a time zone unknown to the runtime', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2024-01-31T12:00:00Z'));
      try {
        mockSessionModel
          .find()
          .exec.mockResolvedValue([session(new Date('2024-01-29T08:00:00Z'))]);

        const result = await service.getSummary('user1', 'Not/AZone');

        expect(result.weekdayActivity).toEqual([1, 0, 0, 0, 0, 0, 0]);
      } finally {
        jest.useRealTimers();
      }
    });

    it('should return the 3 most practised routines with their names', async () => {
      mockSessionModel
        .find()
        .exec.mockResolvedValue([
          ...[1, 2, 3, 4].map((d) => session(daysAgo(d), 'squash')),
          ...[1, 2, 3].map((d) => session(daysAgo(d), 'douce')),
          ...[1, 2].map((d) => session(daysAgo(d), 'bureau')),
          session(daysAgo(1), 'rare'),
        ]);
      mockRoutines([
        { id: 'bureau', name: 'Pause bureau' },
        { id: 'squash', name: 'Squash quotidien' },
        { id: 'douce', name: 'Routine douce' },
      ]);

      const result = await service.getSummary('user1');

      expect(result.topRoutines).toEqual([
        { routineId: 'squash', name: 'Squash quotidien', count: 4 },
        { routineId: 'douce', name: 'Routine douce', count: 3 },
        { routineId: 'bureau', name: 'Pause bureau', count: 2 },
      ]);
      expect(mockRoutineModel.find).toHaveBeenCalledWith({
        id: { $in: ['squash', 'douce', 'bureau'] },
      });
    });

    it('should rank ties by the most recently practised routine', async () => {
      mockSessionModel
        .find()
        .exec.mockResolvedValue([
          session(daysAgo(10), 'older'),
          session(daysAgo(2), 'newer'),
        ]);
      mockRoutines([
        { id: 'older', name: 'Ancienne' },
        { id: 'newer', name: 'Nouvelle' },
      ]);

      const result = await service.getSummary('user1');

      expect(result.topRoutines.map((r) => r.routineId)).toEqual([
        'newer',
        'older',
      ]);
    });

    it('should label a routine deleted since the session', async () => {
      mockSessionModel
        .find()
        .exec.mockResolvedValue([session(daysAgo(1), 'deleted-routine')]);
      mockRoutines([]);

      const result = await service.getSummary('user1');

      expect(result.topRoutines).toEqual([
        { routineId: 'deleted-routine', name: 'Routine supprimée', count: 1 },
      ]);
    });
  });
});
