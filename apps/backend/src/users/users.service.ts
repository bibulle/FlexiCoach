import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(user: Partial<User>): Promise<User> {
    const created = new this.userModel(user);
    return created.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, user, { new: true }).exec();
  }

  async updateSettings(
    id: string,
    settings: Partial<User['settings']>,
  ): Promise<User | null> {
    // Build $set with dot notation to merge individual keys
    // instead of replacing the entire settings object
    const setObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(settings)) {
      if (value !== undefined) {
        setObj[`settings.${key}`] = value;
      }
    }
    if (Object.keys(setObj).length === 0) {
      return this.userModel.findById(id).exec();
    }
    return this.userModel
      .findByIdAndUpdate(id, { $set: setObj }, { new: true })
      .exec();
  }

  async remove(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async verifyPassword(id: string, password: string): Promise<boolean> {
    const user = await this.userModel.findById(id).select('+password').exec();
    if (!user || !user.password) return false;
    return bcrypt.compare(password, user.password);
  }

  async updatePassword(id: string, newPassword: string): Promise<User | null> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.userModel
      .findByIdAndUpdate(id, { password: hashedPassword }, { new: true })
      .exec();
  }
}
