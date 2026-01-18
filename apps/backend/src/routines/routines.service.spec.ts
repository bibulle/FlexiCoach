import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoutinesService } from './routines.service';
import { Routine, RoutineDocument } from '../schemas/routine.schema';
import {
  rootMongooseTestModule,
  closeInMongodConnection,
} from '../test-utils/mongodb-test.module';

describe('RoutinesService', () => {
  let service: RoutinesService;
  let moduleRef: TestingModule;
  let routineModel: Model<RoutineDocument>;
  const testUserId = 'user-123';

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: Routine.name, schema: require('../schemas/routine.schema').RoutineSchema },
        ]),
      ],
      providers: [RoutinesService],
    }).compile();

    service = moduleRef.get<RoutinesService>(RoutinesService);
    routineModel = moduleRef.get<Model<RoutineDocument>>(
      getModelToken(Routine.name)
    );
  }, 30000);

  afterAll(async () => {
    await moduleRef.close();
    await closeInMongodConnection();
  });

  afterEach(async () => {
    await routineModel.deleteMany({});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all routines', async () => {
      await service.create({
        name: 'Routine 1',
        steps: [
          { name: 'Step 1', seconds: 30, mode: 'mouvement', text: 'Do this' },
        ],
      }, testUserId);
      await service.create({
        name: 'Routine 2',
        steps: [
          { name: 'Step 2', seconds: 60, mode: 'statique', text: 'Do that' },
        ],
      }, testUserId);

      const routines = await service.findAll();

      expect(routines).toHaveLength(2);
      expect(routines[0].name).toBe('Routine 1');
      expect(routines[1].name).toBe('Routine 2');
    });
  });

  describe('findAllForUser', () => {
    it('should return built-in and user routines for a specific user', async () => {
      // Create a built-in routine manually
      await routineModel.create({
        id: 'builtin-1',
        slug: 'builtin-routine',
        name: 'Built-in Routine',
        duration: 5,
        level: 'beginner',
        steps: [{ name: 'Step', seconds: 30, mode: 'mouvement', text: 'Test' }],
        totalSeconds: 30,
        visibility: 'builtIn',
      });

      // Create user routines
      await service.create({
        name: 'My Routine',
        steps: [{ name: 'Step', seconds: 30, mode: 'mouvement', text: 'My step' }],
      }, testUserId);

      await service.create({
        name: 'Other User Routine',
        steps: [{ name: 'Step', seconds: 30, mode: 'mouvement', text: 'Other' }],
      }, 'other-user');

      const routines = await service.findAllForUser(testUserId);

      expect(routines).toHaveLength(2);
      expect(routines.some(r => r.visibility === 'builtIn')).toBe(true);
      expect(routines.some(r => r.name === 'My Routine')).toBe(true);
      expect(routines.some(r => r.name === 'Other User Routine')).toBe(false);
    });
  });

  describe('findOne', () => {
    it('should find routine by ID', async () => {
      const created = await service.create({
        name: 'Test Routine',
        steps: [
          { name: 'Step', seconds: 45, mode: 'respiration', text: 'Breathe' },
        ],
      }, testUserId);

      const routine = await service.findOne(created.id);

      expect(routine).toBeDefined();
      expect(routine?.id).toBe(created.id);
      expect(routine?.name).toBe('Test Routine');
    });

    it('should return null for non-existent ID', async () => {
      const routine = await service.findOne('non-existent');
      expect(routine).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('should find routine by slug', async () => {
      const created = await service.create({
        name: 'Morning Stretch',
        steps: [
          { name: 'Warm up', seconds: 30, mode: 'mouvement', text: 'Stretch' },
        ],
      }, testUserId);

      const routine = await service.findBySlug(created.slug);

      expect(routine).toBeDefined();
      expect(routine?.slug).toBe(created.slug);
      expect(routine?.name).toBe('Morning Stretch');
    });

    it('should return null for non-existent slug', async () => {
      const routine = await service.findBySlug('non-existent-slug');
      expect(routine).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a routine with auto-generated ID and slug', async () => {
      const routineData = {
        name: 'New Routine',
        description: 'A new routine',
        difficulty: 'intermediate' as 'intermediate',
        steps: [
          { name: 'Step 1', seconds: 60, mode: 'mouvement' as 'mouvement', text: 'Move' },
          { name: 'Step 2', seconds: 30, mode: 'statique' as 'statique', text: 'Hold' },
        ],
      };

      const routine = await service.create(routineData, testUserId);

      expect(routine).toBeDefined();
      expect(routine.id).toBeDefined();
      expect(routine.slug).toBeDefined();
      expect(routine.name).toBe('New Routine');
      expect(routine.steps).toHaveLength(2);
      expect(routine.totalSeconds).toBe(90);
      expect(routine.duration).toBe(2); // ceil(90/60)
      expect(routine.level).toBe('intermediate');
      expect(routine.visibility).toBe('user');
      expect(routine.ownerId).toBe(testUserId);
    });

    it('should generate unique slugs for routines with same name', async () => {
      const routine1 = await service.create({
        name: 'Morning Routine',
        steps: [{ name: 'Step', seconds: 30, mode: 'mouvement', text: 'Test' }],
      }, testUserId);

      const routine2 = await service.create({
        name: 'Morning Routine',
        steps: [{ name: 'Step', seconds: 30, mode: 'mouvement', text: 'Test' }],
      }, testUserId);

      expect(routine1.slug).not.toBe(routine2.slug);
      expect(routine2.slug).toMatch(/morning-routine-\d+/);
    });
  });

  describe('update', () => {
    it('should update a routine and recalculate duration', async () => {
      const created = await service.create({
        name: 'Original Name',
        steps: [
          { name: 'Step', seconds: 30, mode: 'mouvement', text: 'Original' },
        ],
      }, testUserId);

      const updated = await service.update(created.id, {
        name: 'Updated Name',
        steps: [
          { name: 'Step 1', seconds: 60, mode: 'mouvement', text: 'Updated' },
          { name: 'Step 2', seconds: 60, mode: 'statique', text: 'More' },
        ],
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.totalSeconds).toBe(120);
      expect(updated?.duration).toBe(2);
      expect(updated?.id).toBe(created.id); // unchanged
    });

    it('should return null for non-existent ID', async () => {
      const updated = await service.update('non-existent', {
        name: 'Test',
      });
      expect(updated).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete a routine', async () => {
      const created = await service.create({
        name: 'Delete Me',
        steps: [
          { name: 'Step', seconds: 30, mode: 'mouvement', text: 'Test' },
        ],
      }, testUserId);

      const deleted = await service.remove(created.id);

      expect(deleted).toBeDefined();
      expect(deleted?.id).toBe(created.id);

      // Verify it's deleted
      const found = await service.findOne(created.id);
      expect(found).toBeNull();
    });

    it('should return null for non-existent ID', async () => {
      const deleted = await service.remove('non-existent');
      expect(deleted).toBeNull();
    });
  });
});
