import { Test, TestingModule } from '@nestjs/testing';
import { RoutinesController } from './routines.controller';
import { RoutinesService } from './routines.service';
import { Routine } from '../schemas/routine.schema';

describe('RoutinesController', () => {
  let controller: RoutinesController;
  let service: jest.Mocked<RoutinesService>;

  const mockRoutine = {
    _id: '123',
    id: 'test-routine',
    name: 'Test Routine',
    slug: 'test-routine',
    description: 'Test Description',
    duration: 10,
    level: 'débutant',
    steps: [],
    totalSeconds: 600,
  } as any;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findBySlug: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoutinesController],
      providers: [
        {
          provide: RoutinesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<RoutinesController>(RoutinesController);
    service = module.get(RoutinesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a routine', async () => {
      const routineData: Partial<Routine> = {
        name: 'New Routine',
        slug: 'new-routine',
        description: 'New Description',
      };

      service.create.mockResolvedValue(mockRoutine);

      const result = await controller.create(routineData);

      expect(result).toEqual(mockRoutine);
      expect(service.create).toHaveBeenCalledWith(routineData);
    });
  });

  describe('findAll', () => {
    it('should return all routines', async () => {
      const routines = [mockRoutine];
      service.findAll.mockResolvedValue(routines);

      const result = await controller.findAll();

      expect(result).toEqual(routines);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a routine by id', async () => {
      service.findOne.mockResolvedValue(mockRoutine);

      const result = await controller.findOne('123');

      expect(result).toEqual(mockRoutine);
      expect(service.findOne).toHaveBeenCalledWith('123');
    });
  });

  describe('findBySlug', () => {
    it('should return a routine by slug', async () => {
      service.findBySlug.mockResolvedValue(mockRoutine);

      const result = await controller.findBySlug('test-routine');

      expect(result).toEqual(mockRoutine);
      expect(service.findBySlug).toHaveBeenCalledWith('test-routine');
    });
  });

  describe('update', () => {
    it('should update a routine', async () => {
      const updateData: Partial<Routine> = {
        name: 'Updated Routine',
      };

      const updatedRoutine = { ...mockRoutine, ...updateData };
      service.update.mockResolvedValue(updatedRoutine);

      const result = await controller.update('123', updateData);

      expect(result).toEqual(updatedRoutine);
      expect(service.update).toHaveBeenCalledWith('123', updateData);
    });
  });

  describe('remove', () => {
    it('should remove a routine', async () => {
      service.remove.mockResolvedValue(mockRoutine);

      const result = await controller.remove('123');

      expect(result).toEqual(mockRoutine);
      expect(service.remove).toHaveBeenCalledWith('123');
    });
  });
});
