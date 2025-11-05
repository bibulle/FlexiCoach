import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Routine, RoutineDocument } from '../schemas/routine.schema';

@Injectable()
export class RoutinesService {
  constructor(
    @InjectModel(Routine.name) private routineModel: Model<RoutineDocument>
  ) {}

  async findAll(): Promise<Routine[]> {
    return this.routineModel.find().exec();
  }

  async findOne(id: string): Promise<Routine | null> {
    return this.routineModel.findOne({ id }).exec();
  }

  async findBySlug(slug: string): Promise<Routine | null> {
    return this.routineModel.findOne({ slug }).exec();
  }

  async create(routine: Partial<Routine>): Promise<Routine> {
    const created = new this.routineModel(routine);
    return created.save();
  }

  async update(id: string, routine: Partial<Routine>): Promise<Routine | null> {
    return this.routineModel
      .findOneAndUpdate({ id }, routine, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Routine | null> {
    return this.routineModel.findOneAndDelete({ id }).exec();
  }
}
