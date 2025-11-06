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

  async getSummary(userId?: string): Promise<{
    currentStreak: number;
    longestStreak: number;
    totalSessions: number;
    totalMinutes: number;
    adherenceRate: number;
    favoriteRoutine: string | null;
  }> {
    const filter: any = userId ? { userId } : {};
    const sessions = await this.sessionModel.find(filter).exec();

    // Total sessions and minutes
    const totalSessions = sessions.length;
    const totalMinutes =
      sessions.reduce((sum, session) => sum + (session.durationSec || 0), 0) /
      60;

    // Group sessions by date
    const sessionsByDate = new Map<string, Session[]>();
    sessions.forEach((session) => {
      const dateStr = session.startAt.toISOString().split('T')[0];
      if (!sessionsByDate.has(dateStr)) {
        sessionsByDate.set(dateStr, []);
      }
      sessionsByDate.get(dateStr)!.push(session);
    });

    // Calculate streaks
    const sortedDates = Array.from(sessionsByDate.keys()).sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    if (sortedDates.length > 0) {
      // Check if today or yesterday has a session to start current streak
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split('T')[0];

      let streakStartDate: string | null = null;
      if (sortedDates.includes(today)) {
        streakStartDate = today;
      } else if (sortedDates.includes(yesterday)) {
        streakStartDate = yesterday;
      }

      if (streakStartDate) {
        // Calculate current streak backwards from streak start date
        let checkDate = new Date(streakStartDate);
        while (true) {
          const dateStr = checkDate.toISOString().split('T')[0];
          if (!sortedDates.includes(dateStr)) {
            break;
          }
          currentStreak++;
          checkDate = new Date(checkDate.getTime() - 86400000); // Go back one day
        }
      }

      // Calculate longest streak
      for (let i = 0; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);

        if (i === 0) {
          tempStreak = 1;
        } else {
          const prevDate = new Date(sortedDates[i - 1]);
          const dayDiff = Math.round(
            (currentDate.getTime() - prevDate.getTime()) / 86400000
          );

          if (dayDiff === 1) {
            tempStreak++;
          } else {
            tempStreak = 1;
          }
        }

        longestStreak = Math.max(longestStreak, tempStreak);
      }
    }

    // Calculate adherence rate (percentage of days with sessions in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const recentSessionDates = sortedDates.filter(
      (date) => new Date(date) >= thirtyDaysAgo
    );
    const adherenceRate =
      recentSessionDates.length > 0
        ? Math.round((recentSessionDates.length / 30) * 100)
        : 0;

    // Find favorite routine
    const routineCounts = new Map<string, number>();
    sessions.forEach((session) => {
      const routineId = session.routineId;
      routineCounts.set(routineId, (routineCounts.get(routineId) || 0) + 1);
    });

    let favoriteRoutine: string | null = null;
    let maxCount = 0;
    routineCounts.forEach((count, routineId) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteRoutine = routineId;
      }
    });

    return {
      currentStreak,
      longestStreak,
      totalSessions,
      totalMinutes: Math.round(totalMinutes),
      adherenceRate,
      favoriteRoutine,
    };
  }
}
