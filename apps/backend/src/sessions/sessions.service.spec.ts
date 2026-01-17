import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SessionsService } from './sessions.service';
import { Session, SessionDocument } from '../schemas/session.schema';
import {
  rootMongooseTestModule,
  closeInMongodConnection,
} from '../test-utils/mongodb-test.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionSchema } from '../schemas/session.schema';

describe('SessionsService', () => {
  let service: SessionsService;
  let sessionModel: Model<SessionDocument>;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
      ],
      providers: [SessionsService],
    }).compile();

    service = moduleRef.get<SessionsService>(SessionsService);
    sessionModel = moduleRef.get<Model<SessionDocument>>(getModelToken(Session.name));
  }, 30000);

  afterEach(async () => {
    await sessionModel.deleteMany({});
  });

  afterAll(async () => {
    await moduleRef.close();
    await closeInMongodConnection();
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
      } as any;

      const result = await service.create(sessionData);

      expect(result).toBeDefined();
      expect(result.userId.toString()).toBe('user1');
      expect(result.routineId).toBe('routine1');
      expect(result.completed).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return all sessions', async () => {
      await service.create({
        userId: 'user1',
        routineId: 'routine1',
        startAt: new Date(),
        durationSec: 600,
        completed: true,
      } as any);
      await service.create({
        userId: 'user2',
        routineId: 'routine2',
        startAt: new Date(),
        durationSec: 300,
        completed: false,
      } as any);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
    });

    it('should filter by userId', async () => {
      await service.create({
        userId: 'user1',
        routineId: 'routine1',
        startAt: new Date(),
        durationSec: 600,
        completed: true,
      } as any);
      await service.create({
        userId: 'user2',
        routineId: 'routine2',
        startAt: new Date(),
        durationSec: 300,
        completed: false,
      } as any);

      const result = await service.findAll('user1');

      expect(result).toHaveLength(1);
      expect(result[0].userId.toString()).toBe('user1');
    });

    it('should sort sessions by startAt descending', async () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-02');
      const date3 = new Date('2024-01-03');

      await service.create({
        userId: 'user1',
        routineId: 'routine1',
        startAt: date1,
        durationSec: 600,
        completed: true,
      } as any);
      await service.create({
        userId: 'user1',
        routineId: 'routine2',
        startAt: date3,
        durationSec: 600,
        completed: true,
      } as any);
      await service.create({
        userId: 'user1',
        routineId: 'routine3',
        startAt: date2,
        durationSec: 600,
        completed: true,
      } as any);

      const result = await service.findAll('user1');

      expect(result).toHaveLength(3);
      expect(new Date(result[0].startAt).getTime()).toBe(date3.getTime());
      expect(new Date(result[1].startAt).getTime()).toBe(date2.getTime());
      expect(new Date(result[2].startAt).getTime()).toBe(date1.getTime());
    });
  });

  describe('findOne', () => {
    it('should find session by id', async () => {
      const created = await service.create({
        userId: 'user1',
        routineId: 'routine1',
        startAt: new Date(),
        durationSec: 600,
        completed: false,
      } as any) as SessionDocument;

      const result = await service.findOne(created._id.toString()) as SessionDocument;

      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(created._id.toString());
    });

    it('should return null for non-existent id', async () => {
      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update session', async () => {
      const created = await service.create({
        userId: 'user1',
        routineId: 'routine1',
        startAt: new Date(),
        durationSec: 600,
        completed: false,
      } as any) as SessionDocument;

      const result = await service.update(created._id.toString(), {
        completed: true,
      });

      expect(result).toBeDefined();
      expect(result?.completed).toBe(true);
    });
  });

  describe('complete', () => {
    it('should mark session as completed with endAt', async () => {
      const created = await service.create({
        userId: 'user1',
        routineId: 'routine1',
        startAt: new Date(),
        durationSec: 600,
        completed: false,
      } as any) as SessionDocument;

      const beforeComplete = new Date();
      const result = await service.complete(created._id.toString(), true);
      const afterComplete = new Date();

      expect(result).toBeDefined();
      expect(result?.completed).toBe(true);
      expect(result?.endAt).toBeDefined();
      expect(new Date(result!.endAt!).getTime()).toBeGreaterThanOrEqual(beforeComplete.getTime());
      expect(new Date(result!.endAt!).getTime()).toBeLessThanOrEqual(afterComplete.getTime());
    });

    it('should mark session with feeling', async () => {
      const created = await service.create({
        userId: 'user1',
        routineId: 'routine1',
        startAt: new Date(),
        durationSec: 600,
        completed: false,
      } as any) as SessionDocument;

      const result = await service.complete(created._id.toString(), true, 5);

      expect(result).toBeDefined();
      expect(result?.completed).toBe(true);
      expect(result?.feeling).toBe(5);
    });
  });

  describe('getStats', () => {
    it('should calculate stats correctly', async () => {
      await service.create({
        userId: 'user1',
        routineId: 'routine1',
        startAt: new Date(),
        durationSec: 600,
        completed: true,
      } as any);
      await service.create({
        userId: 'user1',
        routineId: 'routine2',
        startAt: new Date(),
        durationSec: 300,
        completed: false,
      } as any);
      await service.create({
        userId: 'user1',
        routineId: 'routine3',
        startAt: new Date(),
        durationSec: 900,
        completed: true,
      } as any);

      const result = await service.getStats('user1');

      expect(result.totalSessions).toBe(3);
      expect(result.completedSessions).toBe(2);
      expect(result.totalMinutes).toBe(30); // (600 + 300 + 900) / 60 = 30
    });

    it('should return zero stats when no sessions', async () => {
      const result = await service.getStats('user1');

      expect(result.totalSessions).toBe(0);
      expect(result.completedSessions).toBe(0);
      expect(result.totalMinutes).toBe(0);
    });

    it('should filter by userId', async () => {
      await service.create({
        userId: 'user1',
        routineId: 'routine1',
        startAt: new Date(),
        durationSec: 600,
        completed: true,
      } as any);
      await service.create({
        userId: 'user2',
        routineId: 'routine2',
        startAt: new Date(),
        durationSec: 600,
        completed: true,
      } as any);

      const result = await service.getStats('user1');

      expect(result.totalSessions).toBe(1);
      expect(result.completedSessions).toBe(1);
    });
  });

  describe('getCalendar', () => {
    it('should group sessions by date', async () => {
      const date1 = new Date('2024-01-01T10:00:00Z');
      const date2 = new Date('2024-01-01T14:00:00Z');
      const date3 = new Date('2024-01-02T10:00:00Z');

      await service.create({
        userId: 'user1',
        routineId: 'routine1',
        startAt: date1,
        durationSec: 600,
        completed: true,
      } as any);
      await service.create({
        userId: 'user1',
        routineId: 'routine2',
        startAt: date2,
        durationSec: 600,
        completed: true,
      } as any);
      await service.create({
        userId: 'user1',
        routineId: 'routine3',
        startAt: date3,
        durationSec: 600,
        completed: false,
      } as any);

      const result = await service.getCalendar('user1');

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2024-01-01');
      expect(result[0].completionRate).toBe(100); // 2/2 completed
      expect(result[1].date).toBe('2024-01-02');
      expect(result[1].completionRate).toBe(0); // 0/1 completed
    });

    it('should filter by date range', async () => {
      await service.create({
        userId: 'user1',
        routineId: 'routine1',
        startAt: new Date('2024-01-01T10:00:00Z'),
        durationSec: 600,
        completed: true,
      } as any);
      await service.create({
        userId: 'user1',
        routineId: 'routine2',
        startAt: new Date('2024-01-15T10:00:00Z'),
        durationSec: 600,
        completed: true,
      } as any);
      await service.create({
        userId: 'user1',
        routineId: 'routine3',
        startAt: new Date('2024-02-01T10:00:00Z'),
        durationSec: 600,
        completed: true,
      } as any);

      const result = await service.getCalendar('user1', '2024-01-01', '2024-01-31');

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2024-01-01');
      expect(result[1].date).toBe('2024-01-15');
    });

    it('should sort calendar by date ascending', async () => {
      await service.create({
        userId: 'user1',
        routineId: 'routine1',
        startAt: new Date('2024-01-03T10:00:00Z'),
        durationSec: 600,
        completed: true,
      } as any);
      await service.create({
        userId: 'user1',
        routineId: 'routine2',
        startAt: new Date('2024-01-01T10:00:00Z'),
        durationSec: 600,
        completed: true,
      } as any);
      await service.create({
        userId: 'user1',
        routineId: 'routine3',
        startAt: new Date('2024-01-02T10:00:00Z'),
        durationSec: 600,
        completed: true,
      } as any);

      const result = await service.getCalendar('user1');

      expect(result).toHaveLength(3);
      expect(result[0].date).toBe('2024-01-01');
      expect(result[1].date).toBe('2024-01-02');
      expect(result[2].date).toBe('2024-01-03');
    });
  });

  describe('getSummary', () => {
    it('should calculate current streak when sessions today', async () => {
      const today = new Date();
      const yesterday = new Date(Date.now() - 86400000);
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000);

      await service.create({
        userId: 'user1',
        routineId: 'routine1',
        startAt: today,
        durationSec: 600,
        completed: true,
      } as any);
      await service.create({
        userId: 'user1',
        routineId: 'routine1',
        startAt: yesterday,
        durationSec: 600,
        completed: true,
      } as any);
      await service.create({
        userId: 'user1',
        routineId: 'routine1',
        startAt: twoDaysAgo,
        durationSec: 600,
        completed: true,
      } as any);

      const result = await service.getSummary('user1');

      expect(result.currentStreak).toBe(3);
    });

    it('should calculate current streak when sessions yesterday but not today', async () => {
      const yesterday = new Date(Date.now() - 86400000);
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000);

      await service.create({
        userId: 'user1',
        routineId: 'routine1',
        startAt: yesterday,
        durationSec: 600,
        completed: true,
      } as any);
      await service.create({
        userId: 'user1',
        routineId: 'routine1',
        startAt: twoDaysAgo,
        durationSec: 600,
        completed: true,
      } as any);

      const result = await service.getSummary('user1');

      expect(result.currentStreak).toBe(2);
    });

    it('should have zero current streak when no recent sessions', async () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000);

      await service.create({
        userId: 'user1',
        routineId: 'routine1',
        startAt: threeDaysAgo,
        durationSec: 600,
        completed: true,
      } as any);

      const result = await service.getSummary('user1');

      expect(result.currentStreak).toBe(0);
    });

    it('should calculate longest streak correctly', async () => {
      // Create a streak of 5 days, then a gap, then 3 days
      const dates = [
        new Date('2024-01-01'),
        new Date('2024-01-02'),
        new Date('2024-01-03'),
        new Date('2024-01-04'),
        new Date('2024-01-05'),
        new Date('2024-01-10'),
        new Date('2024-01-11'),
        new Date('2024-01-12'),
      ];

      for (const date of dates) {
        await service.create({
          userId: 'user1',
          routineId: 'routine1',
          startAt: date,
          durationSec: 600,
          completed: true,
        } as any);
      }

      const result = await service.getSummary('user1');

      expect(result.longestStreak).toBe(5);
    });

    it('should find favorite routine', async () => {
      await service.create({
        userId: 'user1',
        routineId: 'routine1',
        startAt: new Date(),
        durationSec: 600,
        completed: true,
      } as any);
      await service.create({
        userId: 'user1',
        routineId: 'routine1',
        startAt: new Date(),
        durationSec: 600,
        completed: true,
      } as any);
      await service.create({
        userId: 'user1',
        routineId: 'routine2',
        startAt: new Date(),
        durationSec: 600,
        completed: true,
      } as any);

      const result = await service.getSummary('user1');

      expect(result.favoriteRoutine).toBe('routine1');
    });

    it('should return null for favoriteRoutine when no sessions', async () => {
      const result = await service.getSummary('user1');

      expect(result.favoriteRoutine).toBeNull();
    });

    it('should calculate adherence rate correctly', async () => {
      // Create sessions on 15 different days in last 30 days
      const today = new Date();
      for (let i = 0; i < 15; i++) {
        const date = new Date(today.getTime() - i * 86400000);
        await service.create({
          userId: 'user1',
          routineId: 'routine1',
          startAt: date,
          durationSec: 600,
          completed: true,
        } as any);
      }

      const result = await service.getSummary('user1');

      expect(result.adherenceRate).toBe(50); // 15/30 = 50%
    });

    it('should calculate total sessions and minutes', async () => {
      await service.create({
        userId: 'user1',
        routineId: 'routine1',
        startAt: new Date(),
        durationSec: 600,
        completed: true,
      } as any);
      await service.create({
        userId: 'user1',
        routineId: 'routine2',
        startAt: new Date(),
        durationSec: 1200,
        completed: true,
      } as any);

      const result = await service.getSummary('user1');

      expect(result.totalSessions).toBe(2);
      expect(result.totalMinutes).toBe(30); // (600 + 1200) / 60 = 30
    });
  });
});
