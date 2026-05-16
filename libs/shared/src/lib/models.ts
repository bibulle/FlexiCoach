export interface Step {
  name: string;
  seconds: number;
  mode: 'mouvement' | 'statique' | 'respiration';
  text: string;
  cues?: Array<{
    at: number;
    say: string;
  }>;
}

export type RoutineTag =
  | 'quotidien'
  | 'bureau'
  | 'sport'
  | 'mobilite'
  | 'respiration';

export interface Routine {
  id: string;
  slug: string;
  name: string;
  description?: string;
  duration: number;
  level: string;
  steps: Step[];
  totalSeconds: number;
  restSeconds?: number;
  version?: number;
  visibility?: 'builtIn' | 'user';
  ownerId?: string;
  tag?: RoutineTag | string;
  isFavorite?: boolean;
}

export interface UserSettings {
  theme?: 'light' | 'dark';
  voiceRate?: number;
  voicePitch?: number;
  voiceVolume?: number;
  sound?: boolean;
  notifications?: boolean;
  reminders?: Array<{
    time: string;
    days: number[];
    enabled: boolean;
  }>;
  favoriteRoutine?: string;
}

export interface User {
  _id?: string;
  email?: string;
  displayName?: string;
  tz?: string;
  settings?: UserSettings;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Session {
  _id?: string;
  userId?: string;
  routineId: string;
  startAt: Date;
  endAt?: Date;
  durationSec: number;
  completed: boolean;
  progress?: number;
  feeling?: number;
  device?: {
    ua: string;
    platform: string;
  };
}

export interface DailySummary {
  _id?: string;
  userId?: string;
  date: string; // 'YYYY-MM-DD'
  routines: Array<{
    routineId: string;
    completed: boolean;
    durationSec: number;
  }>;
  totalSec: number;
  streakAfter?: number;
}

export interface Stats {
  totalSessions: number;
  currentStreak: number;
  bestStreak: number;
  totalMinutes?: number;
}
