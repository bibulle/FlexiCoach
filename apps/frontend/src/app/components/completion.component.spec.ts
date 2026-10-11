import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CompletionComponent } from './completion.component';
import { SessionService } from '../services/session.service';

describe('CompletionComponent', () => {
  let component: CompletionComponent;
  let fixture: ComponentFixture<CompletionComponent>;
  let mockRouter: any;
  let mockActivatedRoute: any;
  let mockSessionService: any;

  beforeEach(async () => {
    mockRouter = {
      navigate: vi.fn(),
    };

    mockActivatedRoute = {
      queryParams: of({
        routineName: 'Test Routine',
        duration: '125',
        sessionId: 'session-123',
      }),
    };

    mockSessionService = {
      update: vi.fn().mockReturnValue(of({})),
    };

    await TestBed.configureTestingModule({
      imports: [CompletionComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: SessionService, useValue: mockSessionService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CompletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load query params on init', () => {
    expect(component.routineName).toBe('Test Routine');
    expect(component.duration).toBe(125);
  });

  it('should format duration correctly', () => {
    expect(component.formatDuration(125)).toBe('2:05');
    expect(component.formatDuration(60)).toBe('1:00');
    expect(component.formatDuration(5)).toBe('0:05');
  });

  it('should select feeling', () => {
    component.selectFeeling(4);
    expect(component.selectedFeeling).toBe(4);
  });

  it('should navigate to the routines catalogue on finish without feeling', () => {
    component.sessionId = '';
    component.selectedFeeling = null;
    component.finish();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/routines']);
    expect(mockSessionService.update).not.toHaveBeenCalled();
  });

  it('should navigate to the routines catalogue without saving when there is no session', () => {
    component.sessionId = '';
    component.selectedFeeling = 4;
    component.finish();
    expect(mockSessionService.update).not.toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/routines']);
  });

  it('should navigate to the routines catalogue even if saving the feeling fails', () => {
    mockSessionService.update.mockReturnValue(
      throwError(() => new Error('Save failed')),
    );
    component.sessionId = 'session-123';
    component.selectedFeeling = 2;
    component.finish();
    expect(mockSessionService.update).toHaveBeenCalledWith('session-123', {
      feeling: 2,
    });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/routines']);
    expect(mockRouter.navigate).not.toHaveBeenCalledWith(['/']);
  });

  it('should render a "Retour aux routines" button that goes to the catalogue', () => {
    component.sessionId = '';
    fixture.detectChanges();

    const button = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((b) => b.textContent?.includes('Retour aux routines'));
    expect(button).toBeTruthy();

    button?.click();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/routines']);
  });

  it('should save feeling and navigate on finish with sessionId', () => {
    component.sessionId = 'session-123';
    component.selectedFeeling = 4;
    component.finish();
    expect(mockSessionService.update).toHaveBeenCalledWith('session-123', {
      feeling: 4,
    });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/routines']);
  });

  it('should have 5 feeling options', () => {
    expect(component.feelings).toHaveLength(5);
    expect(component.feelings[0].value).toBe(1);
    expect(component.feelings[4].value).toBe(5);
  });
});
