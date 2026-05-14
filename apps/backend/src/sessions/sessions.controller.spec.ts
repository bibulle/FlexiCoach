import { Test, TestingModule } from '@nestjs/testing';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { User } from '../schemas/user.schema';
import { Session } from '../schemas/session.schema';
import { Types } from 'mongoose';

describe('SessionsController', () => {
  let controller: SessionsController;
  let service: jest.Mocked<SessionsService>;

  const mockUser: User = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    email: 'test@example.com',
    displayName: 'Test User',
  } as User;

  const mockSession: Session = {
    _id: '123',
    userId: mockUser._id,
    routineId: 'routine1',
    startAt: new Date(),
    durationSec: 600,
    completed: false,
  } as any;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      complete: jest.fn(),
      getStats: jest.fn(),
      getSummary: jest.fn(),
      getCalendar: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionsController],
      providers: [
        {
          provide: SessionsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<SessionsController>(SessionsController);
    service = module.get(SessionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a session with userId from current user', async () => {
      const createDto = {
        routineId: 'routine1',
        startAt: new Date(),
        durationSec: 600,
      };

      service.create.mockResolvedValue(mockSession);

      const result = await controller.create(mockUser, createDto as any);

      expect(result).toEqual(mockSession);
      expect(service.create).toHaveBeenCalledWith({
        ...createDto,
        userId: mockUser._id.toString(),
      });
    });
  });

  describe('findAll', () => {
    it('should return all sessions for current user', async () => {
      const sessions = [mockSession];
      service.findAll.mockResolvedValue(sessions);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual(sessions);
      expect(service.findAll).toHaveBeenCalledWith(mockUser._id.toString());
    });
  });

  describe('findOne', () => {
    it('should return a session owned by the user', async () => {
      const ownedSession = {
        ...mockSession,
        userId: mockUser._id.toString(),
      };
      service.findOne.mockResolvedValue(ownedSession);

      const result = await controller.findOne(mockUser, '123');

      expect(result).toEqual(ownedSession);
      expect(service.findOne).toHaveBeenCalledWith('123');
    });

    it('should throw ForbiddenException for session owned by another user', async () => {
      const otherSession = { ...mockSession, userId: 'other-user-id' as any };
      service.findOne.mockResolvedValue(otherSession);

      await expect(controller.findOne(mockUser, '123')).rejects.toThrow(
        'Access denied',
      );
    });

    it('should throw NotFoundException for non-existent session', async () => {
      service.findOne.mockResolvedValue(null);

      await expect(controller.findOne(mockUser, '123')).rejects.toThrow(
        'Session not found',
      );
    });
  });

  describe('update', () => {
    it('should update a session owned by the user', async () => {
      const updateDto = { completed: true };
      const ownedSession = {
        ...mockSession,
        userId: mockUser._id.toString(),
      };
      const updatedSession = { ...ownedSession, completed: true };

      service.findOne.mockResolvedValue(ownedSession);
      service.update.mockResolvedValue(updatedSession);

      const result = await controller.update(
        mockUser,
        '123',
        updateDto as any,
      );

      expect(result).toEqual(updatedSession);
      expect(service.update).toHaveBeenCalledWith('123', updateDto);
    });

    it('should throw ForbiddenException when updating another user session', async () => {
      const otherSession = { ...mockSession, userId: 'other-user-id' as any };
      service.findOne.mockResolvedValue(otherSession);

      await expect(
        controller.update(mockUser, '123', {} as any),
      ).rejects.toThrow('Access denied');
      expect(service.update).not.toHaveBeenCalled();
    });
  });

  describe('complete', () => {
    it('should complete a session owned by the user', async () => {
      const completeDto = { completed: true, feeling: 5 };
      const ownedSession = {
        ...mockSession,
        userId: mockUser._id.toString(),
      };
      const completedSession = { ...ownedSession, completed: true, feeling: 5 };

      service.findOne.mockResolvedValue(ownedSession);
      service.complete.mockResolvedValue(completedSession);

      const result = await controller.complete(
        mockUser,
        '123',
        completeDto as any,
      );

      expect(result).toEqual(completedSession);
      expect(service.complete).toHaveBeenCalledWith('123', true, 5);
    });

    it('should throw ForbiddenException when completing another user session', async () => {
      const otherSession = { ...mockSession, userId: 'other-user-id' as any };
      service.findOne.mockResolvedValue(otherSession);

      await expect(
        controller.complete(mockUser, '123', { completed: true } as any),
      ).rejects.toThrow('Access denied');
      expect(service.complete).not.toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return stats for current user', async () => {
      const stats = {
        totalSessions: 10,
        completedSessions: 8,
        totalMinutes: 450,
      };

      service.getStats.mockResolvedValue(stats);

      const result = await controller.getStats(mockUser);

      expect(result).toEqual(stats);
      expect(service.getStats).toHaveBeenCalledWith(mockUser._id.toString());
    });
  });

  describe('getSummary', () => {
    it('should return summary for current user', async () => {
      const summary = {
        currentStreak: 5,
        longestStreak: 10,
        totalSessions: 25,
        totalMinutes: 1250,
        adherenceRate: 75,
        favoriteRoutine: 'Routine Matinale',
      };

      service.getSummary.mockResolvedValue(summary);

      const result = await controller.getSummary(mockUser);

      expect(result).toEqual(summary);
      expect(service.getSummary).toHaveBeenCalledWith(mockUser._id.toString());
    });
  });

  describe('getCalendar', () => {
    it('should return calendar data for current user', async () => {
      const calendar = [
        { date: '2024-01-01', completionRate: 100 },
        { date: '2024-01-02', completionRate: 50 },
      ];

      const query = { from: '2024-01-01', to: '2024-01-31' };

      service.getCalendar.mockResolvedValue(calendar);

      const result = await controller.getCalendar(mockUser, query as any);

      expect(result).toEqual(calendar);
      expect(service.getCalendar).toHaveBeenCalledWith(
        mockUser._id.toString(),
        '2024-01-01',
        '2024-01-31',
      );
    });
  });
});
