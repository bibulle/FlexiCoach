import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Routine, RoutineDocument } from '../schemas/routine.schema';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';

@Injectable()
export class RoutinesService {
  constructor(
    @InjectModel(Routine.name) private routineModel: Model<RoutineDocument>
  ) {}

  async findAll(): Promise<Routine[]> {
    return this.routineModel.find().exec();
  }

  async findAllForUser(userId: string): Promise<Routine[]> {
    // Return built-in routines and user's own routines
    return this.routineModel
      .find({
        $or: [
          { visibility: 'builtIn' },
          { visibility: 'user', ownerId: userId },
        ],
      })
      .exec();
  }

  async findOne(id: string): Promise<Routine | null> {
    return this.routineModel.findOne({ id }).exec();
  }

  async findBySlug(slug: string): Promise<Routine | null> {
    return this.routineModel.findOne({ slug }).exec();
  }

  async create(createRoutineDto: CreateRoutineDto, userId: string): Promise<Routine> {
    // Generate unique ID and slug
    const id = `routine-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const baseSlug = createRoutineDto.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Ensure unique slug
    let slug = baseSlug;
    let counter = 1;
    while (await this.routineModel.findOne({ slug }).exec()) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Calculate total seconds
    const totalSeconds = createRoutineDto.steps.reduce(
      (acc, step) => acc + step.seconds,
      0
    );

    // Calculate duration in minutes
    const duration = Math.ceil(totalSeconds / 60);

    const routineData = {
      id,
      slug,
      name: createRoutineDto.name,
      description: createRoutineDto.description,
      duration,
      level: createRoutineDto.difficulty || 'beginner',
      steps: createRoutineDto.steps,
      totalSeconds,
      restSeconds: 10, // Default rest time between steps
      version: 1,
      visibility: 'user',
      ownerId: userId,
    };

    const created = new this.routineModel(routineData);
    return created.save();
  }

  async update(id: string, updateRoutineDto: UpdateRoutineDto): Promise<Routine | null> {
    const updateData: Partial<Routine> = {
      ...updateRoutineDto,
    };

    // Map difficulty to level (DTO uses difficulty, schema uses level)
    if ('difficulty' in updateRoutineDto && updateRoutineDto.difficulty) {
      updateData['level'] = updateRoutineDto.difficulty;
      delete updateData['difficulty'];
    }

    // Recalculate totalSeconds and duration if steps are updated
    if (updateRoutineDto.steps) {
      const totalSeconds = updateRoutineDto.steps.reduce(
        (acc, step) => acc + step.seconds,
        0
      );
      updateData.totalSeconds = totalSeconds;
      updateData.duration = Math.ceil(totalSeconds / 60);
    }

    return this.routineModel
      .findOneAndUpdate({ id }, updateData, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Routine | null> {
    return this.routineModel.findOneAndDelete({ id }).exec();
  }
}
