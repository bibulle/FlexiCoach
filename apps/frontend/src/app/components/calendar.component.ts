import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { startOfWeek, addDays, format, isBefore, startOfDay } from 'date-fns';
import { catchError, of, forkJoin } from 'rxjs';
import { StatsService, StatsSummary } from '../services/stats.service';

export interface HeatDay {
  date: Date;
  dateStr: string;
  intensity: number;
  future: boolean;
}

export interface MonthlyPoint {
  label: string;
  sessions: number;
}

export interface TrendSvg {
  path: string;
  area: string;
  points: { x: number; y: number }[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
  private statsService = inject(StatsService);
  private http = inject(HttpClient);

  currentYear = new Date().getFullYear();
  availableYears: number[] = [];
  summary: StatsSummary | null = null;
  calendarData: { date: string; completionRate: number }[] = [];
  loading = true;

  readonly MONTH_LABELS = [
    'Jan',
    'Fév',
    'Mar',
    'Avr',
    'Mai',
    'Jun',
    'Jul',
    'Aoû',
    'Sep',
    'Oct',
    'Nov',
    'Déc',
  ];
  readonly HEAT_LABELS = ['L', 'M', 'V', 'D'];
  readonly TREND_W = 720;
  readonly TREND_PAD_X = 8;

  ngOnInit(): void {
    const y = this.currentYear;
    this.availableYears = [y - 2, y - 1, y];
    this.loadData();
  }

  selectYear(year: number): void {
    this.currentYear = year;
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    const from = `${this.currentYear}-01-01`;
    const to = `${this.currentYear}-12-31`;

    forkJoin({
      summary: this.statsService.getSummary().pipe(catchError(() => of(null))),
      calendar: this.http
        .get<
          { date: string; completionRate: number }[]
        >(`/api/sessions/calendar?from=${from}&to=${to}`)
        .pipe(catchError(() => of([]))),
    }).subscribe(({ summary, calendar }) => {
      this.summary = summary;
      this.calendarData = calendar ?? [];
      this.loading = false;
    });
  }

  heatIntensity(completionRate: number): number {
    if (completionRate <= 0) return 0;
    if (completionRate < 40) return 0.4;
    if (completionRate < 80) return 0.7;
    return 1;
  }

  getHeatColor(intensity: number): string {
    if (intensity === 0) return 'var(--surface-2)';
    const l = (0.85 - intensity * 0.25).toFixed(3);
    const c = (0.06 + intensity * 0.1).toFixed(3);
    return `oklch(${l} ${c} 145)`;
  }

  get heatWeeks(): HeatDay[][] {
    const today = startOfDay(new Date());
    const jan1 = new Date(this.currentYear, 0, 1);
    const weekStart = startOfWeek(jan1, { weekStartsOn: 1 });
    const dataMap = new Map(
      this.calendarData.map((d) => [d.date, d.completionRate]),
    );
    const weeks: HeatDay[][] = [];
    let current = weekStart;

    for (let w = 0; w < 54; w++) {
      const week: HeatDay[] = [];
      for (let d = 0; d < 7; d++) {
        const date = addDays(current, d);
        if (date.getFullYear() > this.currentYear) break;
        const dateStr = format(date, 'yyyy-MM-dd');
        const future = isBefore(today, date);
        const rate = dataMap.get(dateStr) ?? 0;
        week.push({
          date,
          dateStr,
          intensity: future ? 0 : this.heatIntensity(rate),
          future,
        });
      }
      if (week.length > 0 && week[0].date.getFullYear() <= this.currentYear) {
        weeks.push(week);
      }
      current = addDays(current, 7);
      if (current.getFullYear() > this.currentYear + 1) break;
    }
    return weeks;
  }

  get monthlyTrend(): MonthlyPoint[] {
    const counts = new Array(12).fill(0);
    this.calendarData.forEach((d) => {
      const month = parseInt(d.date.split('-')[1], 10) - 1;
      if (month >= 0 && month < 12 && d.completionRate > 0) counts[month]++;
    });
    return this.MONTH_LABELS.map((label, i) => ({
      label,
      sessions: counts[i],
    }));
  }

  get totalSessions(): number {
    return this.summary?.totalSessions ?? 0;
  }

  get totalHours(): number {
    return Math.round((this.summary?.totalMinutes ?? 0) / 60);
  }

  get currentStreak(): number {
    return this.summary?.currentStreak ?? 0;
  }

  get peakMonth(): string {
    const trend = this.monthlyTrend;
    const max = Math.max(...trend.map((t) => t.sessions));
    if (max === 0) return '—';
    return trend.find((t) => t.sessions === max)?.label ?? '—';
  }

  get peakIndex(): number {
    const trend = this.monthlyTrend;
    const max = Math.max(...trend.map((t) => t.sessions));
    return max === 0 ? -1 : trend.findIndex((t) => t.sessions === max);
  }

  buildTrendSvg(height: number): TrendSvg {
    const trend = this.monthlyTrend;
    const max = Math.max(...trend.map((t) => t.sessions), 1);
    const innerW = this.TREND_W - this.TREND_PAD_X * 2;
    const points = trend.map((t, i) => ({
      x: this.TREND_PAD_X + (i / (trend.length - 1)) * innerW,
      y: height - 28 - (t.sessions / max) * (height - 48),
    }));

    const path = points.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      const prev = points[i - 1];
      const cx = ((prev.x + p.x) / 2).toFixed(1);
      return `${acc} C ${cx} ${prev.y.toFixed(1)}, ${cx} ${p.y.toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    }, '');

    const last = points[points.length - 1];
    const first = points[0];
    const area = `${path} L ${last.x.toFixed(1)} ${height - 28} L ${first.x.toFixed(1)} ${height - 28} Z`;

    return { path, area, points };
  }

  get trendDesktop(): TrendSvg {
    return this.buildTrendSvg(150);
  }
  get trendMobile(): TrendSvg {
    return this.buildTrendSvg(100);
  }
}
