import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UploadResult {
  imageUrl: string;
  originalName: string;
  size: number;
}

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private readonly apiUrl = '/api/uploads/image';

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadResult>(this.apiUrl, formData);
  }
}
