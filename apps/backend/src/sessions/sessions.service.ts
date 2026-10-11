import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from '../schemas/session.schema';
import { Routine, RoutineDocument } from '../schemas/routine.schema';

/** Window of the "recent activity" statistics (weekday split, top routines). */
export const RECENT_ACTIVITY_DAYS = 30;
/** Number of routines returned in the top. */
export const TOP_ROUTINES_LIMIT = 3;

export interface TopRoutine {
  routineId: string;
  name: string;
  count: number;
}

const WEEKDAY_INDEX: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(Routine.name) private routineModel: Model<RoutineDocument>,
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
    feeling?: number,
  ): Promise<Session | null> {
    return this.sessionModel
      .findByIdAndUpdate(
        id,
        { completed, endAt: new Date(), feeling },
        { new: true },
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
        sessions.reduce((acc, s) => acc + s.durationSec, 0) / 60,
      ),
    };
  }

  async getCalendar(
    userId?: string,
    from?: string,
    to?: string,
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

  /**
   * Weekday (0 = Monday … 6 = Sunday) of a date in the given IANA time zone.
   * Falls back to UTC when the time zone is unknown to the runtime.
   */
  private weekdayIndex(date: Date, timeZone: string): number {
    let weekday: string;
    try {
      weekday = new Intl.DateTimeFormat('en-US', {
        timeZone,
        weekday: 'short',
      }).format(date);
    } catch {
      weekday = new Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        weekday: 'short',
      }).format(date);
    }
    return WEEKDAY_INDEX[weekday];
  }

  /**
   * Sessions of the last RECENT_ACTIVITY_DAYS days split by weekday, and the
   * most practised routines over the same period.
   */
  private async getRecentActivity(
    sessions: Session[],
    timeZone: string,
  ): Promise<{
    recentSessions: number;
    weekdayActivity: number[];
    topRoutines: TopRoutine[];
  }> {
    const since = Date.now() - RECENT_ACTIVITY_DAYS * 86400000;
    const recent = sessions.filter((s) => s.startAt.getTime() >= since);

    const weekdayActivity = [0, 0, 0, 0, 0, 0, 0];
    const byRoutine = new Map<string, { count: number; last: number }>();
    recent.forEach((session) => {
      weekdayActivity[this.weekdayIndex(session.startAt, timeZone)]++;
      const entry = byRoutine.get(session.routineId) ?? { count: 0, last: 0 };
      entry.count++;
      entry.last = Math.max(entry.last, session.startAt.getTime());
      byRoutine.set(session.routineId, entry);
    });

    // Most practised first; ties go to the most recently practised routine
    const top = Array.from(byRoutine.entries())
      .sort(
        ([idA, a], [idB, b]) =>
          b.count - a.count || b.last - a.last || idA.localeCompare(idB),
      )
      .slice(0, TOP_ROUTINES_LIMIT);

    let names = new Map<string, string>();
    if (top.length > 0) {
      const routines = await this.routineModel
        .find({ id: { $in: top.map(([routineId]) => routineId) } })
        .exec();
      names = new Map(routines.map((r) => [r.id, r.name]));
    }

    return {
      recentSessions: recent.length,
      weekdayActivity,
      topRoutines: top.map(([routineId, { count }]) => ({
        routineId,
        // The routine may have been deleted since the session
        name: names.get(routineId) ?? 'Routine supprimée',
        count,
      })),
    };
  }

  async getSummary(
    userId?: string,
    timeZone = 'UTC',
  ): Promise<{
    currentStreak: number;
    longestStreak: number;
    totalSessions: number;
    totalMinutes: number;
    adherenceRate: number;
    favoriteRoutine: string | null;
    recentSessions: number;
    weekdayActivity: number[];
    topRoutines: TopRoutine[];
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
            (currentDate.getTime() - prevDate.getTime()) / 86400000,
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
      (date) => new Date(date) >= thirtyDaysAgo,
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

    let favoriteRoutineId: string | null = null;
    let maxCount = 0;
    routineCounts.forEach((count, routineId) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteRoutineId = routineId;
      }
    });

    // Resolve the routine name from its ID
    let favoriteRoutine: string | null = null;
    if (favoriteRoutineId) {
      const routine = await this.routineModel
        .findOne({ id: favoriteRoutineId })
        .exec();
      favoriteRoutine = routine ? routine.name : favoriteRoutineId;
    }

    const recentActivity = await this.getRecentActivity(sessions, timeZone);

    return {
      currentStreak,
      longestStreak,
      totalSessions,
      totalMinutes: Math.round(totalMinutes),
      adherenceRate,
      favoriteRoutine,
      ...recentActivity,
    };
  }
}
