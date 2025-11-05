import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Routine } from '@flexicoach/shared';

@Injectable({
  providedIn: 'root',
})
export class RoutineService {
  private readonly apiUrl = '/api/routines';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Routine[]> {
    return this.http.get<Routine[]>(this.apiUrl);
  }

  getById(id: string): Observable<Routine> {
    return this.http.get<Routine>(`${this.apiUrl}/${id}`);
  }

  getBySlug(slug: string): Observable<Routine> {
    return this.http.get<Routine>(`${this.apiUrl}/slug/${slug}`);
  }

  create(routine: Partial<Routine>): Observable<Routine> {
    return this.http.post<Routine>(this.apiUrl, routine);
  }

  update(id: string, routine: Partial<Routine>): Observable<Routine> {
    return this.http.patch<Routine>(`${this.apiUrl}/${id}`, routine);
  }

  delete(id: string): Observable<Routine> {
    return this.http.delete<Routine>(`${this.apiUrl}/${id}`);
  }
}
