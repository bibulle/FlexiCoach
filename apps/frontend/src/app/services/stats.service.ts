import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StatsSummary {
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  totalMinutes: number;
  adherenceRate: number;
  favoriteRoutine: string | null;
  /** Number of sessions over the last 30 days. */
  recentSessions: number;
  /** Sessions of the last 30 days per weekday, Monday first (7 values). */
  weekdayActivity: number[];
  /** Most practised routines over the last 30 days (3 at most). */
  topRoutines: TopRoutine[];
}

export interface TopRoutine {
  routineId: string;
  name: string;
  count: number;
}

/** IANA time zone of the browser, when it exposes one. */
export function browserTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
  } catch {
    return undefined;
  }
}

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private baseUrl = '/api/sessions';

  constructor(private http: HttpClient) {}

  getSummary(userId?: string): Observable<StatsSummary> {
    const params: Record<string, string> = {};
    if (userId) {
      params['userId'] = userId;
    }
    // Lets the backend split the sessions by weekday in the user's local time
    const tz = browserTimeZone();
    if (tz) {
      params['tz'] = tz;
    }
    return this.http.get<StatsSummary>(`${this.baseUrl}/stats/summary`, {
      params,
    });
  }
}
