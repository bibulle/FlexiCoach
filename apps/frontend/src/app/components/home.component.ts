import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Routine } from '@flexicoach/shared';
import { RoutineService } from '../services/routine.service';
import { StatsService, StatsSummary } from '../services/stats.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  summary: StatsSummary | null = null;
  routines: Routine[] = [];
  loading = false;
  readonly today = new Date();

  constructor(
    private statsService: StatsService,
    private routineService: RoutineService,
    public authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.loading = true;
    this.statsService.getSummary().subscribe({
      next: (s) => {
        this.summary = s;
      },
      error: () => {
        this.summary = null;
      },
    });
    this.routineService.getAll().subscribe({
      next: (r) => {
        this.routines = r.slice(0, 4);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  get displayName(): string {
    const user = this.authService.getCurrentUser?.();
    return user?.displayName?.split(' ')[0] ?? '';
  }

  get greeting(): string {
    const h = this.today.getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  get formattedDate(): string {
    return this.today.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }

  // SVG ring helpers
  readonly RING_STROKE = 14;
  readonly RING_GAP = 8;
  readonly RINGS_CX = 110;
  readonly RINGS_CY = 110;
  readonly R_OUTER = 96;
  readonly R_MID = 74; // 96 - 14 - 8
  readonly R_INNER = 52; // 74 - 14 - 8

  ringDasharray(r: number, pct: number): string {
    const c = 2 * Math.PI * r;
    return `${c * Math.min(1, Math.max(0, pct))} ${c}`;
  }

  get adherencePct(): number {
    return (this.summary?.adherenceRate ?? 0) / 100;
  }
  get streakPct(): number {
    const s = this.summary;
    if (!s) return 0;
    return Math.min(1, s.currentStreak / Math.max(s.longestStreak, 7, 1));
  }
  get sessionsPct(): number {
    const s = this.summary;
    if (!s || s.totalSessions === 0) return 0;
    return Math.min(1, (s.totalSessions % 7) / 7 || 1);
  }

  get ringRows(): {
    label: string;
    color: string;
    r: number;
    pct: number;
    current: string;
    sub: string;
  }[] {
    const s = this.summary;
    return [
      {
        label: 'Adhérence',
        color: 'var(--primary-500)',
        r: this.R_OUTER,
        pct: this.adherencePct,
        current: `${s?.adherenceRate ?? 0} %`,
        sub: '30 derniers jours',
      },
      {
        label: 'Série',
        color: 'var(--mode-stat)',
        r: this.R_MID,
        pct: this.streakPct,
        current: `${s?.currentStreak ?? 0} jours`,
        sub: `Record ${s?.longestStreak ?? 0} j`,
      },
      {
        label: 'Sessions',
        color: 'var(--warn)',
        r: this.R_INNER,
        pct: this.sessionsPct,
        current: `${s?.totalSessions ?? 0}`,
        sub: 'au total',
      },
    ];
  }

  selectRoutine(routine: Routine) {
    this.router.navigate(['/routine', routine.slug]);
  }

  getBadgeClass(level: string): string {
    switch (level) {
      case 'Débutant':
        return 'badge-debutant';
      case 'Intermédiaire':
        return 'badge-intermediaire';
      case 'Avancé':
        return 'badge-avance';
      default:
        return 'badge-intermediaire';
    }
  }
}
