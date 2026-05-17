import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, tap, switchMap } from 'rxjs';

export interface UserSettings {
  theme?: 'light' | 'dark';
  voiceRate?: number;
  voicePitch?: number;
  voiceVolume?: number;
  voiceName?: string;
  sound?: boolean;
  notifications?: boolean;
  reminders?: Array<{
    time: string;
    days: number[];
    enabled: boolean;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly apiUrl = '/api/users/me/settings';

  constructor(private http: HttpClient) {}

  load(): Observable<any> {
    return this.http.get<any>('/api/users/me').pipe(
      switchMap((user) => {
        const backendSettings = user?.settings;
        const hasBackendSettings = backendSettings &&
          Object.keys(backendSettings).some(
            (k) => backendSettings[k] !== undefined && backendSettings[k] !== null,
          );

        if (hasBackendSettings) {
          this.applyToLocalStorage(backendSettings);
          return of(user);
        }

        const localSettings = this.collectFromLocalStorage();
        if (localSettings) {
          return this.save(localSettings).pipe(
            tap(() => {}),
            catchError(() => of(null)),
            switchMap(() => of(user)),
          );
        }

        return of(user);
      }),
      catchError(() => of(null)),
    );
  }

  save(settings: UserSettings): Observable<any> {
    return this.http.patch<any>(this.apiUrl, settings).pipe(
      catchError(() => of(null)),
    );
  }

  private collectFromLocalStorage(): UserSettings | null {
    const settings: UserSettings = {};
    let hasAny = false;

    const theme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (theme && (theme === 'light' || theme === 'dark')) {
      settings.theme = theme;
      hasAny = true;
    }

    try {
      const remindersRaw = localStorage.getItem('reminders');
      if (remindersRaw) {
        settings.reminders = JSON.parse(remindersRaw);
        hasAny = true;
      }
    } catch { /* ignore */ }

    try {
      const voiceRaw = localStorage.getItem('voiceSettings');
      if (voiceRaw) {
        const v = JSON.parse(voiceRaw);
        if (v.speed !== undefined) { settings.voiceRate = v.speed; hasAny = true; }
        if (v.volume !== undefined) { settings.voiceVolume = v.volume; hasAny = true; }
        if (v.bips !== undefined) { settings.sound = v.bips; hasAny = true; }
        if (v.voiceName) { settings.voiceName = v.voiceName; hasAny = true; }
      }
    } catch { /* ignore */ }

    return hasAny ? settings : null;
  }

  private applyToLocalStorage(settings: UserSettings): void {
    if (settings.theme) {
      localStorage.setItem('theme', settings.theme);
    }

    if (settings.reminders) {
      localStorage.setItem('reminders', JSON.stringify(settings.reminders));
    }

    const voiceSettings: any = {};
    if (settings.voiceRate !== undefined) voiceSettings.speed = settings.voiceRate;
    if (settings.voiceVolume !== undefined) voiceSettings.volume = settings.voiceVolume;
    if (settings.sound !== undefined) voiceSettings.bips = settings.sound;
    if (settings.voiceName) voiceSettings.voiceName = settings.voiceName;
    if (Object.keys(voiceSettings).length > 0) {
      const existing = this.getExistingVoiceSettings();
      localStorage.setItem(
        'voiceSettings',
        JSON.stringify({ ...existing, ...voiceSettings }),
      );
    }
  }

  private getExistingVoiceSettings(): any {
    try {
      const raw = localStorage.getItem('voiceSettings');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }
}
