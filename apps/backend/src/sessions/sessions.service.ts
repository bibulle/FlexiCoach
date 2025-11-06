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

  async getCalendar(
    userId?: string,
    from?: string,
    to?: string
  ): Promise<Array<{ date: string; completionRate: number }>> {
    const filter: any = userId ? { userId } : {};

    // Add date range filter if provided
    if (from || to) {
      filter.startAt = {};
      if (from) {
        filter.startAt.$gte = new Date(from);
      }
      if (to) {
        filter.startAt.$lte = new Date(to);
      }
    }

    const sessions = await this.sessionModel.find(filter).exec();

    // Group sessions by date
    const sessionsByDate = new Map<string, Session[]>();
    sessions.forEach((session) => {
      const dateStr = session.startAt.toISOString().split('T')[0];
      if (!sessionsByDate.has(dateStr)) {
        sessionsByDate.set(dateStr, []);
      }
      sessionsByDate.get(dateStr)!.push(session);
    });

    // Calculate completion rate for each date
    const calendar: Array<{ date: string; completionRate: number }> = [];
    sessionsByDate.forEach((daySessions, date) => {
      const completed = daySessions.filter((s) => s.completed).length;
      const total = daySessions.length;
      const completionRate =
        total > 0 ? Math.round((completed / total) * 100) : 0;
      calendar.push({ date, completionRate });
    });

    return calendar.sort((a, b) => a.date.localeCompare(b.date));
  }
}
