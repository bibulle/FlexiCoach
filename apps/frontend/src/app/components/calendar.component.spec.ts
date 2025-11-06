import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CalendarComponent } from './calendar.component';
import { format, addMonths, subMonths } from 'date-fns';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarComponent, RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with current month', () => {
    expect(component.currentDate).toBeInstanceOf(Date);
    expect(component.days.length).toBeGreaterThan(0);
  });

  it('should generate calendar grid with 35 or 42 days', () => {
    // Calendar grid should be 5 or 6 weeks (35 or 42 days)
    expect([35, 42]).toContain(component.days.length);
  });

  it('should navigate to previous month', () => {
    const initialDate = new Date(component.currentDate);
    component.previousMonth();

    const expectedDate = subMonths(initialDate, 1);
    expect(component.currentDate.getMonth()).toBe(expectedDate.getMonth());
    expect(component.currentDate.getFullYear()).toBe(
      expectedDate.getFullYear()
    );
  });

  it('should navigate to next month', () => {
    const initialDate = new Date(component.currentDate);
    component.nextMonth();

    const expectedDate = addMonths(initialDate, 1);
    expect(component.currentDate.getMonth()).toBe(expectedDate.getMonth());
    expect(component.currentDate.getFullYear()).toBe(
      expectedDate.getFullYear()
    );
  });

  it('should mark current day as today', () => {
    const today = new Date();
    expect(component.isToday(today)).toBe(true);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(component.isToday(yesterday)).toBe(false);
  });

  it('should return correct adherence for complete day', () => {
    component.calendarData = [{ date: '2025-11-01', completionRate: 100 }];
    const date = new Date('2025-11-01');
    expect(component.getAdherence(date)).toBe('complete');
  });

  it('should return correct adherence for partial day', () => {
    component.calendarData = [{ date: '2025-11-01', completionRate: 50 }];
    const date = new Date('2025-11-01');
    expect(component.getAdherence(date)).toBe('partial');
  });

  it('should return missed for past day without data', () => {
    component.calendarData = [];
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    expect(component.getAdherence(pastDate)).toBe('missed');
  });

  it('should return none for future dates', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    expect(component.getAdherence(futureDate)).toBe('none');
  });

  it('should have 7 weekday headers', () => {
    expect(component.weekDays.length).toBe(7);
  });

  it('should format month and year correctly', () => {
    component.currentDate = new Date('2025-11-05');
    const monthYear = component.monthYear;
    expect(monthYear).toContain('novembre');
    expect(monthYear).toContain('2025');
  });

  it('should get correct day number', () => {
    const date = new Date('2025-11-15');
    expect(component.getDayNumber(date)).toBe(15);
  });
});
