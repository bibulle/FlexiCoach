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
    return this.http.get<StatsSummary>(`${this.baseUrl}/stats/summary`, {
      params,
    });
  }
}
