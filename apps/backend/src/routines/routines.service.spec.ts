import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RoutinesService } from './routines.service';
import { Routine } from '../schemas/routine.schema';

describe('RoutinesService', () => {
  let service: RoutinesService;
  let mockRoutineModel: any;
  const testUserId = 'user-123';

  const mockRoutine = {
    _id: 'mock-mongo-id',
    id: 'routine-123',
    slug: 'test-routine',
    name: 'Test Routine',
    description: 'Test Description',
    duration: 1,
    level: 'beginner',
    steps: [
      { name: 'Step 1', seconds: 30, mode: 'mouvement', text: 'Do this' },
    ],
    totalSeconds: 30,
    restSeconds: 10,
    version: 1,
    visibility: 'user',
    ownerId: testUserId,
  };

  beforeEach(async () => {
    // Create mock functions
    const mockExec = jest.fn();
    const mockSelect = jest.fn().mockReturnValue({ exec: mockExec });
    const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
    const mockFind = jest.fn().mockReturnValue({ exec: mockExec, sort: mockSort });
    const mockFindOne = jest.fn().mockReturnValue({ exec: mockExec, select: mockSelect });
    const mockFindOneAndUpdate = jest.fn().mockReturnValue({ exec: mockExec });
    const mockFindOneAndDelete = jest.fn().mockReturnValue({ exec: mockExec });

    // Create a mock model constructor
    mockRoutineModel = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue({ ...mockRoutine, ...data }),
    }));
    mockRoutineModel.find = mockFind;
    mockRoutineModel.findOne = mockFindOne;
    mockRoutineModel.findOneAndUpdate = mockFindOneAndUpdate;
    mockRoutineModel.findOneAndDelete = mockFindOneAndDelete;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoutinesService,
        {
          provide: getModelToken(Routine.name),
          useValue: mockRoutineModel,
        },
      ],
    }).compile();

    service = module.get<RoutinesService>(RoutinesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all routines', async () => {
      const mockRoutines = [mockRoutine, { ...mockRoutine, id: 'routine-456', name: 'Routine 2' }];
      mockRoutineModel.find().exec.mockResolvedValue(mockRoutines);

      const result = await service.findAll();

      expect(result).toEqual(mockRoutines);
      expect(mockRoutineModel.find).toHaveBeenCalled();
    });

    it('should return empty array when no routines exist', async () => {
      mockRoutineModel.find().exec.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findAllForUser', () => {
    it('should return built-in and user routines for a specific user', async () => {
      const builtInRoutine = { ...mockRoutine, visibility: 'builtIn' };
      const userRoutine = { ...mockRoutine, visibility: 'user', ownerId: testUserId };
      mockRoutineModel.find().exec.mockResolvedValue([builtInRoutine, userRoutine]);

      const result = await service.findAllForUser(testUserId);

      expect(result).toHaveLength(2);
      expect(mockRoutineModel.find).toHaveBeenCalledWith({
        $or: [
          { visibility: 'builtIn' },
          { visibility: 'user', ownerId: testUserId },
        ],
      });
    });

    it('should filter out other users routines', async () => {
      mockRoutineModel.find().exec.mockResolvedValue([]);

      await service.findAllForUser(testUserId);

      expect(mockRoutineModel.find).toHaveBeenCalledWith({
        $or: [
          { visibility: 'builtIn' },
          { visibility: 'user', ownerId: testUserId },
        ],
      });
    });
  });

  describe('findOne', () => {
    it('should find routine by ID', async () => {
      mockRoutineModel.findOne().exec.mockResolvedValue(mockRoutine);

      const result = await service.findOne('routine-123');

      expect(result).toEqual(mockRoutine);
      expect(mockRoutineModel.findOne).toHaveBeenCalledWith({ id: 'routine-123' });
    });

    it('should return null for non-existent ID', async () => {
      mockRoutineModel.findOne().exec.mockResolvedValue(null);

      const result = await service.findOne('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('should find routine by slug', async () => {
      mockRoutineModel.findOne().exec.mockResolvedValue(mockRoutine);

      const result = await service.findBySlug('test-routine');

      expect(result).toEqual(mockRoutine);
      expect(mockRoutineModel.findOne).toHaveBeenCalledWith({ slug: 'test-routine' });
    });

    it('should return null for non-existent slug', async () => {
      mockRoutineModel.findOne().exec.mockResolvedValue(null);

      const result = await service.findBySlug('non-existent-slug');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a routine with auto-generated ID and slug', async () => {
      // Mock findOne to return null (slug doesn't exist)
      mockRoutineModel.findOne().exec.mockResolvedValue(null);

      const routineData = {
        name: 'New Routine',
        description: 'A new routine',
        difficulty: 'intermediate' as const,
        steps: [
          { name: 'Step 1', seconds: 60, mode: 'mouvement' as const, text: 'Move' },
          { name: 'Step 2', seconds: 30, mode: 'statique' as const, text: 'Hold' },
        ],
      };

      const result = await service.create(routineData, testUserId);

      expect(result).toBeDefined();
      expect(result.name).toBe('New Routine');
      expect(result.totalSeconds).toBe(90);
      expect(result.duration).toBe(2); // ceil(90/60)
      expect(result.level).toBe('intermediate');
      expect(result.visibility).toBe('user');
      expect(result.ownerId).toBe(testUserId);
      expect(result.id).toMatch(/^routine-\d+-[a-z0-9]+$/);
      expect(result.slug).toBe('new-routine');
    });

    it('should generate unique slugs for routines with same name', async () => {
      // First call returns existing routine, second call returns null (unique slug found)
      mockRoutineModel.findOne().exec
        .mockResolvedValueOnce({ slug: 'morning-routine' }) // First slug exists
        .mockResolvedValueOnce(null); // Second slug is unique

      const routineData = {
        name: 'Morning Routine',
        steps: [{ name: 'Step', seconds: 30, mode: 'mouvement' as const, text: 'Test' }],
      };

      const result = await service.create(routineData, testUserId);

      expect(result.slug).toBe('morning-routine-1');
    });

    it('should calculate totalSeconds correctly', async () => {
      mockRoutineModel.findOne().exec.mockResolvedValue(null);

      const routineData = {
        name: 'Test Routine',
        steps: [
          { name: 'Step 1', seconds: 30, mode: 'mouvement' as const, text: 'Test' },
          { name: 'Step 2', seconds: 45, mode: 'statique' as const, text: 'Test' },
          { name: 'Step 3', seconds: 60, mode: 'respiration' as const, text: 'Test' },
        ],
      };

      const result = await service.create(routineData, testUserId);

      expect(result.totalSeconds).toBe(135);
      expect(result.duration).toBe(3); // ceil(135/60)
    });

    it('should normalize slug (remove accents, special chars)', async () => {
      mockRoutineModel.findOne().exec.mockResolvedValue(null);

      const routineData = {
        name: 'Étirement Matinal !',
        steps: [{ name: 'Step', seconds: 30, mode: 'mouvement' as const, text: 'Test' }],
      };

      const result = await service.create(routineData, testUserId);

      expect(result.slug).toBe('etirement-matinal');
    });

    it('should use beginner as default level when no difficulty provided', async () => {
      mockRoutineModel.findOne().exec.mockResolvedValue(null);

      const routineData = {
        name: 'Test Routine',
        steps: [{ name: 'Step', seconds: 30, mode: 'mouvement' as const, text: 'Test' }],
      };

      const result = await service.create(routineData, testUserId);

      expect(result.level).toBe('beginner');
    });
  });

  describe('update', () => {
    it('should update a routine and recalculate duration', async () => {
      const updatedRoutine = {
        ...mockRoutine,
        name: 'Updated Name',
        steps: [
          { name: 'Step 1', seconds: 60, mode: 'mouvement', text: 'Updated' },
          { name: 'Step 2', seconds: 60, mode: 'statique', text: 'More' },
        ],
        totalSeconds: 120,
        duration: 2,
      };
      mockRoutineModel.findOneAndUpdate().exec.mockResolvedValue(updatedRoutine);

      const result = await service.update('routine-123', {
        name: 'Updated Name',
        steps: [
          { name: 'Step 1', seconds: 60, mode: 'mouvement' as const, text: 'Updated' },
          { name: 'Step 2', seconds: 60, mode: 'statique' as const, text: 'More' },
        ],
      });

      expect(result).toEqual(updatedRoutine);
      expect(mockRoutineModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: 'routine-123' },
        expect.objectContaining({
          name: 'Updated Name',
          totalSeconds: 120,
          duration: 2,
        }),
        { new: true }
      );
    });

    it('should map difficulty to level', async () => {
      mockRoutineModel.findOneAndUpdate().exec.mockResolvedValue(mockRoutine);

      await service.update('routine-123', {
        difficulty: 'advanced' as const,
      });

      expect(mockRoutineModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: 'routine-123' },
        expect.objectContaining({
          level: 'advanced',
        }),
        { new: true }
      );
    });

    it('should return null for non-existent ID', async () => {
      mockRoutineModel.findOneAndUpdate().exec.mockResolvedValue(null);

      const result = await service.update('non-existent', { name: 'Test' });

      expect(result).toBeNull();
    });

    it('should not recalculate duration if steps are not updated', async () => {
      mockRoutineModel.findOneAndUpdate().exec.mockResolvedValue({
        ...mockRoutine,
        name: 'Only Name Updated',
      });

      await service.update('routine-123', { name: 'Only Name Updated' });

      expect(mockRoutineModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: 'routine-123' },
        expect.not.objectContaining({
          totalSeconds: expect.any(Number),
          duration: expect.any(Number),
        }),
        { new: true }
      );
    });
  });

  describe('remove', () => {
    it('should delete a routine', async () => {
      mockRoutineModel.findOneAndDelete().exec.mockResolvedValue(mockRoutine);

      const result = await service.remove('routine-123');

      expect(result).toEqual(mockRoutine);
      expect(mockRoutineModel.findOneAndDelete).toHaveBeenCalledWith({ id: 'routine-123' });
    });

    it('should return null for non-existent ID', async () => {
      mockRoutineModel.findOneAndDelete().exec.mockResolvedValue(null);

      const result = await service.remove('non-existent');

      expect(result).toBeNull();
    });
  });
});
