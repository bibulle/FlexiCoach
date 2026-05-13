import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CalendarComponent } from './calendar.component';
import { StatsService } from '../services/stats.service';
import { HttpClient } from '@angular/common/http';

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;
  let mockStatsService: any;
  let mockHttp: any;

  const mockSummary = {
    currentStreak: 7,
    longestStreak: 14,
    totalSessions: 42,
    totalMinutes: 1620,
    adherenceRate: 85,
    favoriteRoutine: null,
  };

  const mockCalendarData = [
    { date: '2026-01-05', completionRate: 100 },
    { date: '2026-01-10', completionRate: 50 },
    { date: '2026-03-15', completionRate: 100 },
    { date: '2026-03-20', completionRate: 100 },
    { date: '2026-03-25', completionRate: 80 },
  ];

  beforeEach(async () => {
    mockStatsService = { getSummary: vi.fn().mockReturnValue(of(mockSummary)) };
    mockHttp = { get: vi.fn().mockReturnValue(of(mockCalendarData)) };

    await TestBed.configureTestingModule({
      imports: [CalendarComponent, RouterTestingModule],
      providers: [
        { provide: StatsService, useValue: mockStatsService },
        { provide: HttpClient, useValue: mockHttp },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with current year', () => {
    expect(component.currentYear).toBe(new Date().getFullYear());
  });

  it('should build availableYears with 3 years ending at current year', () => {
    const y = new Date().getFullYear();
    expect(component.availableYears).toEqual([y - 2, y - 1, y]);
  });

  it('should generate heatmap with at least 52 weeks', () => {
    expect(component.heatWeeks.length).toBeGreaterThanOrEqual(52);
  });

  it('should select a different year and reload data', () => {
    const y = component.currentYear - 1;
    component.selectYear(y);
    expect(component.currentYear).toBe(y);
    expect(mockHttp.get).toHaveBeenCalledTimes(2);
  });

  it('should return intensity 0 for completionRate 0', () => {
    expect(component.heatIntensity(0)).toBe(0);
  });

  it('should return intensity 0.4 for completionRate < 40', () => {
    expect(component.heatIntensity(20)).toBe(0.4);
  });

  it('should return intensity 0.7 for completionRate 40–79', () => {
    expect(component.heatIntensity(60)).toBe(0.7);
  });

  it('should return intensity 1 for completionRate >= 80', () => {
    expect(component.heatIntensity(100)).toBe(1);
    expect(component.heatIntensity(80)).toBe(1);
  });

  it('should return surface-2 color for intensity 0', () => {
    expect(component.getHeatColor(0)).toBe('var(--surface-2)');
  });

  it('should return oklch color for positive intensity', () => {
    const color = component.getHeatColor(1);
    expect(color).toContain('oklch');
    expect(color).toContain('145');
  });

  it('should compute totalSessions from summary', () => {
    expect(component.totalSessions).toBe(42);
  });

  it('should compute totalHours from summary minutes', () => {
    expect(component.totalHours).toBe(27);
  });

  it('should compute currentStreak from summary', () => {
    expect(component.currentStreak).toBe(7);
  });

  it('should compute peakMonth from monthly trend (most active month)', () => {
    component.calendarData = mockCalendarData;
    // March has 3 entries → should be peak
    expect(component.peakMonth).toBe('Mar');
  });

  it('should return — for peakMonth when no data', () => {
    component.calendarData = [];
    expect(component.peakMonth).toBe('—');
  });

  it('should mark future days as future=true in heatWeeks', () => {
    const allDays = component.heatWeeks.flat();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDays = allDays.filter((d) => d.date > today);
    expect(futureDays.every((d) => d.future)).toBe(true);
  });

  it('should handle stats API error gracefully (totalSessions = 0)', () => {
    component.summary = null;
    expect(component.totalSessions).toBe(0);
    expect(component.totalHours).toBe(0);
    expect(component.currentStreak).toBe(0);
  });

  it('should build trend SVG path string for desktop (height 150)', () => {
    const svg = component.buildTrendSvg(150);
    expect(svg.path).toContain('M');
    expect(svg.area).toContain('Z');
    expect(svg.points.length).toBe(12);
  });

  it('should build 12 monthly trend points', () => {
    expect(component.monthlyTrend.length).toBe(12);
    expect(component.monthlyTrend[0].label).toBe('Jan');
    expect(component.monthlyTrend[11].label).toBe('Déc');
  });

  it('should have MONTH_LABELS with 12 entries', () => {
    expect(component.MONTH_LABELS.length).toBe(12);
  });
});
