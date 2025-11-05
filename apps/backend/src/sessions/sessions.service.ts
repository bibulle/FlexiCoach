import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from '../schemas/session.schema';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>
  ) {}

  async create(session: Partial<Session>): Promise<Session> {
    const created = new this.sessionModel(session);
    return created.save();
  }

  async findAll(userId?: string): Promise<Session[]> {
    const filter = userId ? { userId } : {};
    return this.sessionModel.find(filter).sort({ startAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Session | null> {
    return this.sessionModel.findById(id).exec();
  }

  async update(id: string, session: Partial<Session>): Promise<Session | null> {
    return this.sessionModel
      .findByIdAndUpdate(id, session, { new: true })
      .exec();
  }

  async complete(
    id: string,
    completed: boolean,
    feeling?: number
  ): Promise<Session | null> {
    return this.sessionModel
      .findByIdAndUpdate(
        id,
        { completed, endAt: new Date(), feeling },
        { new: true }
      )
      .exec();
  }

  async getStats(userId?: string): Promise<{
    totalSessions: number;
    completedSessions: number;
    totalMinutes: number;
  }> {
    const filter = userId ? { userId } : {};
    const sessions = await this.sessionModel.find(filter).exec();

    return {
      totalSessions: sessions.length,
      completedSessions: sessions.filter((s) => s.completed).length,
      totalMinutes: Math.round(
        sessions.reduce((acc, s) => acc + s.durationSec, 0) / 60
      ),
    };
  }
}
