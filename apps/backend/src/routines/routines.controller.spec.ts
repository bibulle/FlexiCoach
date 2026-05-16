import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RoutinesController } from './routines.controller';
import { RoutinesService } from './routines.service';
import { User } from '../schemas/user.schema';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('RoutinesController', () => {
  let controller: RoutinesController;
  let service: jest.Mocked<RoutinesService>;
  let userModel: any;

  const mockUser = {
    _id: 'user-123',
    email: 'test@example.com',
  } as User;

  const mockRoutine = {
    _id: '123',
    id: 'test-routine',
    name: 'Test Routine',
    slug: 'test-routine',
    description: 'Test Description',
    duration: 10,
    level: 'débutant',
    steps: [
      {
        name: 'Step 1',
        seconds: 30,
        mode: 'mouvement',
        text: 'Test step',
      },
    ],
    totalSeconds: 600,
    visibility: 'user',
    ownerId: 'user-123',
    toJSON() {
      return { ...this };
    },
  } as any;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllForUser: jest.fn(),
      findOne: jest.fn(),
      findBySlug: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    userModel = {
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ favoriteRoutines: [] }),
      }),
      findByIdAndUpdate: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoutinesController],
      providers: [
        {
          provide: RoutinesService,
          useValue: mockService,
        },
        {
          provide: getModelToken(User.name),
          useValue: userModel,
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
    it('should create a routine for authenticated user', async () => {
      const routineData = {
        name: 'New Routine',
        description: 'New Description',
        steps: [
          {
            name: 'Step 1',
            seconds: 30,
            mode: 'mouvement' as 'mouvement',
            text: 'Do this',
          },
        ],
      };

      service.create.mockResolvedValue(mockRoutine);

      const result = await controller.create(routineData, mockUser);

      expect(result).toEqual(mockRoutine);
      expect(service.create).toHaveBeenCalledWith(routineData, mockUser._id);
    });
  });

  describe('import', () => {
    it('should import a routine with valid format', async () => {
      const importData = {
        version: '1.0',
        routine: {
          name: 'Imported Routine',
          steps: [
            {
              name: 'Step 1',
              seconds: 30,
              mode: 'mouvement' as 'mouvement',
              text: 'Imported step',
            },
          ],
        },
      };

      service.create.mockResolvedValue(mockRoutine);

      const result = await controller.import(importData, mockUser);

      expect(result).toEqual(mockRoutine);
      expect(service.create).toHaveBeenCalledWith(
        importData.routine,
        mockUser._id,
      );
    });
  });

  describe('findAll', () => {
    it('should return routines with isFavorite flag', async () => {
      const routines = [mockRoutine];
      service.findAllForUser.mockResolvedValue(routines);
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ favoriteRoutines: ['test-routine'] }),
      });

      const result = await controller.findAll(mockUser);

      expect(result[0].isFavorite).toBe(true);
      expect(service.findAllForUser).toHaveBeenCalledWith(mockUser._id);
    });

    it('should return isFavorite false when not in favorites', async () => {
      const routines = [mockRoutine];
      service.findAllForUser.mockResolvedValue(routines);
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ favoriteRoutines: [] }),
      });

      const result = await controller.findAll(mockUser);

      expect(result[0].isFavorite).toBe(false);
    });
  });

  describe('findOne', () => {
    it('should return a routine by id for owner', async () => {
      service.findOne.mockResolvedValue(mockRoutine);

      const result = await controller.findOne('test-routine', mockUser);

      expect(result).toEqual(mockRoutine);
      expect(service.findOne).toHaveBeenCalledWith('test-routine');
    });

    it('should throw NotFoundException if routine not found', async () => {
      service.findOne.mockResolvedValue(null);

      await expect(
        controller.findOne('non-existent', mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const otherRoutine = { ...mockRoutine, ownerId: 'other-user' };
      service.findOne.mockResolvedValue(otherRoutine);

      await expect(
        controller.findOne('test-routine', mockUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow access to built-in routines', async () => {
      const builtInRoutine = { ...mockRoutine, visibility: 'builtIn' };
      service.findOne.mockResolvedValue(builtInRoutine);

      const result = await controller.findOne('test-routine', mockUser);

      expect(result).toEqual(builtInRoutine);
    });
  });

  describe('findBySlug', () => {
    it('should return a routine by slug for owner', async () => {
      service.findBySlug.mockResolvedValue(mockRoutine);

      const result = await controller.findBySlug('test-routine', mockUser);

      expect(result).toEqual(mockRoutine);
      expect(service.findBySlug).toHaveBeenCalledWith('test-routine');
    });

    it('should throw NotFoundException if routine not found', async () => {
      service.findBySlug.mockResolvedValue(null);

      await expect(
        controller.findBySlug('non-existent', mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const otherRoutine = { ...mockRoutine, ownerId: 'other-user' };
      service.findBySlug.mockResolvedValue(otherRoutine);

      await expect(
        controller.findBySlug('test-routine', mockUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update a routine for owner', async () => {
      const updateData = {
        name: 'Updated Routine',
      };

      const updatedRoutine = { ...mockRoutine, ...updateData };
      service.findOne.mockResolvedValue(mockRoutine);
      service.update.mockResolvedValue(updatedRoutine);

      const result = await controller.update(
        'test-routine',
        updateData,
        mockUser,
      );

      expect(result).toEqual(updatedRoutine);
      expect(service.update).toHaveBeenCalledWith('test-routine', updateData);
    });

    it('should throw NotFoundException if routine not found', async () => {
      service.findOne.mockResolvedValue(null);

      await expect(
        controller.update('non-existent', {}, mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const otherRoutine = { ...mockRoutine, ownerId: 'other-user' };
      service.findOne.mockResolvedValue(otherRoutine);

      await expect(
        controller.update('test-routine', {}, mockUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove a routine for owner', async () => {
      service.findOne.mockResolvedValue(mockRoutine);
      service.remove.mockResolvedValue(mockRoutine);

      await controller.remove('test-routine', mockUser);

      expect(service.remove).toHaveBeenCalledWith('test-routine');
    });

    it('should throw NotFoundException if routine not found', async () => {
      service.findOne.mockResolvedValue(null);

      await expect(controller.remove('non-existent', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const otherRoutine = { ...mockRoutine, ownerId: 'other-user' };
      service.findOne.mockResolvedValue(otherRoutine);

      await expect(controller.remove('test-routine', mockUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('addFavorite', () => {
    it('should add routine to favorites', async () => {
      service.findOne.mockResolvedValue(mockRoutine);

      const result = await controller.addFavorite('test-routine', mockUser);

      expect(result).toEqual({ success: true });
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(mockUser._id, {
        $addToSet: { favoriteRoutines: 'test-routine' },
      });
    });

    it('should throw NotFoundException if routine not found', async () => {
      service.findOne.mockResolvedValue(null);

      await expect(
        controller.addFavorite('non-existent', mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeFavorite', () => {
    it('should remove routine from favorites', async () => {
      const result = await controller.removeFavorite('test-routine', mockUser);

      expect(result).toEqual({ success: true });
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(mockUser._id, {
        $pull: { favoriteRoutines: 'test-routine' },
      });
    });
  });
});
