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
});
