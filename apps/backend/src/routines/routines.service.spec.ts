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
        id: 'routine-1',
        slug: 'routine-1',
        name: 'Routine 1',
        duration: 10,
        level: 'beginner',
        steps: [
          { name: 'Step 1', seconds: 30, mode: 'mouvement', text: 'Do this' },
        ],
        totalSeconds: 30,
      });
      await service.create({
        id: 'routine-2',
        slug: 'routine-2',
        name: 'Routine 2',
        duration: 20,
        level: 'intermediate',
        steps: [
          { name: 'Step 2', seconds: 60, mode: 'statique', text: 'Do that' },
        ],
        totalSeconds: 60,
      });

      const routines = await service.findAll();

      expect(routines).toHaveLength(2);
      expect(routines[0].name).toBe('Routine 1');
      expect(routines[1].name).toBe('Routine 2');
    });
  });

  describe('findOne', () => {
    it('should find routine by ID', async () => {
      await service.create({
        id: 'test-routine',
        slug: 'test-slug',
        name: 'Test Routine',
        duration: 15,
        level: 'advanced',
        steps: [
          { name: 'Step', seconds: 45, mode: 'respiration', text: 'Breathe' },
        ],
        totalSeconds: 45,
      });

      const routine = await service.findOne('test-routine');

      expect(routine).toBeDefined();
      expect(routine?.id).toBe('test-routine');
      expect(routine?.name).toBe('Test Routine');
    });

    it('should return null for non-existent ID', async () => {
      const routine = await service.findOne('non-existent');
      expect(routine).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('should find routine by slug', async () => {
      await service.create({
        id: 'routine-id',
        slug: 'morning-stretch',
        name: 'Morning Stretch',
        duration: 10,
        level: 'beginner',
        steps: [
          { name: 'Warm up', seconds: 30, mode: 'mouvement', text: 'Stretch' },
        ],
        totalSeconds: 30,
      });

      const routine = await service.findBySlug('morning-stretch');

      expect(routine).toBeDefined();
      expect(routine?.slug).toBe('morning-stretch');
      expect(routine?.name).toBe('Morning Stretch');
    });

    it('should return null for non-existent slug', async () => {
      const routine = await service.findBySlug('non-existent-slug');
      expect(routine).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a routine', async () => {
      const routineData = {
        id: 'new-routine',
        slug: 'new-routine-slug',
        name: 'New Routine',
        description: 'A new routine',
        duration: 25,
        level: 'intermediate',
        steps: [
          { name: 'Step 1', seconds: 60, mode: 'mouvement', text: 'Move' },
          { name: 'Step 2', seconds: 30, mode: 'statique', text: 'Hold' },
        ],
        totalSeconds: 90,
        restSeconds: 15,
      };

      const routine = await service.create(routineData);

      expect(routine).toBeDefined();
      expect(routine.id).toBe('new-routine');
      expect(routine.name).toBe('New Routine');
      expect(routine.steps).toHaveLength(2);
      expect(routine.restSeconds).toBe(15);
    });
  });

  describe('update', () => {
    it('should update a routine', async () => {
      await service.create({
        id: 'update-test',
        slug: 'original-slug',
        name: 'Original Name',
        duration: 10,
        level: 'beginner',
        steps: [
          { name: 'Step', seconds: 30, mode: 'mouvement', text: 'Original' },
        ],
        totalSeconds: 30,
      });

      const updated = await service.update('update-test', {
        name: 'Updated Name',
        duration: 20,
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.duration).toBe(20);
      expect(updated?.id).toBe('update-test'); // unchanged
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
      await service.create({
        id: 'delete-test',
        slug: 'delete-slug',
        name: 'Delete Me',
        duration: 10,
        level: 'beginner',
        steps: [
          { name: 'Step', seconds: 30, mode: 'mouvement', text: 'Test' },
        ],
        totalSeconds: 30,
      });

      const deleted = await service.remove('delete-test');

      expect(deleted).toBeDefined();
      expect(deleted?.id).toBe('delete-test');

      // Verify it's deleted
      const found = await service.findOne('delete-test');
      expect(found).toBeNull();
    });

    it('should return null for non-existent ID', async () => {
      const deleted = await service.remove('non-existent');
      expect(deleted).toBeNull();
    });
  });
});
