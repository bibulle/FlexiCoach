import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isSameDay,
  parseISO,
} from 'date-fns';
import { fr } from 'date-fns/locale';

interface DayData {
  date: Date;
  isCurrentMonth: boolean;
  adherence: 'complete' | 'partial' | 'missed' | 'none';
}

interface CalendarData {
  date: string;
  completionRate: number; // 0-100
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
  currentDate = new Date();
  days: DayData[] = [];
  weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  // Mock data - sera remplacé par un appel API
  calendarData: CalendarData[] = [];

  ngOnInit() {
    this.loadCalendarData();
    this.generateCalendar();
  }

  generateCalendar() {
    const monthStart = startOfMonth(this.currentDate);
    const monthEnd = endOfMonth(this.currentDate);

    // Start from Monday of the week containing the first day of the month
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    // End on Sunday of the week containing the last day of the month
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const allDays = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });

    this.days = allDays.map((date) => ({
      date,
      isCurrentMonth: isSameMonth(date, this.currentDate),
      adherence: this.getAdherence(date),
    }));
  }

  getAdherence(date: Date): 'complete' | 'partial' | 'missed' | 'none' {
    // Vérifier si la date est dans le futur
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date > today) {
      return 'none';
    }

    const dateStr = format(date, 'yyyy-MM-dd');
    const data = this.calendarData.find((d) => d.date === dateStr);

    if (!data) {
      // Pas de données = jour manqué (si dans le passé)
      return 'missed';
    }

    if (data.completionRate >= 100) return 'complete';
    if (data.completionRate > 0) return 'partial';
    return 'missed';
  }

  previousMonth() {
    this.currentDate = subMonths(this.currentDate, 1);
    this.loadCalendarData();
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate = addMonths(this.currentDate, 1);
    this.loadCalendarData();
    this.generateCalendar();
  }

  get monthYear(): string {
    return format(this.currentDate, 'MMMM yyyy', { locale: fr });
  }

  getDayNumber(date: Date): number {
    return date.getDate();
  }

  isToday(date: Date): boolean {
    return isSameDay(date, new Date());
  }

  loadCalendarData() {
    // TODO: Remplacer par un vrai appel API
    // GET /api/sessions/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD
    const monthStart = startOfMonth(this.currentDate);
    const monthEnd = endOfMonth(this.currentDate);

    // Mock data pour démonstration
    this.calendarData = [
      { date: '2025-11-01', completionRate: 100 },
      { date: '2025-11-02', completionRate: 100 },
      { date: '2025-11-03', completionRate: 50 },
      { date: '2025-11-05', completionRate: 100 },
    ];
  }
}
