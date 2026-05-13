import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Session } from '@flexicoach/shared';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly apiUrl = '/api/sessions';

  constructor(private http: HttpClient) {}

  getAll(userId?: string): Observable<Session[]> {
    const url = userId ? `${this.apiUrl}?userId=${userId}` : this.apiUrl;
    return this.http.get<Session[]>(url);
  }

  getById(id: string): Observable<Session> {
    return this.http.get<Session>(`${this.apiUrl}/${id}`);
  }

  getStats(userId?: string): Observable<{
    totalSessions: number;
    completedSessions: number;
    totalMinutes: number;
  }> {
    const url = userId
      ? `${this.apiUrl}/stats?userId=${userId}`
      : `${this.apiUrl}/stats`;
    return this.http.get<{
      totalSessions: number;
      completedSessions: number;
      totalMinutes: number;
    }>(url);
  }

  create(session: Partial<Session>): Observable<Session> {
    return this.http.post<Session>(this.apiUrl, session);
  }

  update(id: string, session: Partial<Session>): Observable<Session> {
    return this.http.patch<Session>(`${this.apiUrl}/${id}`, session);
  }

  complete(
    id: string,
    completed: boolean,
    feeling?: number,
  ): Observable<Session> {
    return this.http.patch<Session>(`${this.apiUrl}/${id}/complete`, {
      completed,
      feeling,
    });
  }
}
