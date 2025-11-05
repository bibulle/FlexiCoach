import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CompletionComponent } from './completion.component';

describe('CompletionComponent', () => {
  let component: CompletionComponent;
  let fixture: ComponentFixture<CompletionComponent>;
  let mockRouter: any;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockRouter = {
      navigate: vi.fn(),
    };

    mockActivatedRoute = {
      queryParams: of({
        routineName: 'Test Routine',
        duration: '125',
      }),
    };

    await TestBed.configureTestingModule({
      imports: [CompletionComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
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

  it('should navigate to home on finish', () => {
    component.finish();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should have 5 feeling options', () => {
    expect(component.feelings).toHaveLength(5);
    expect(component.feelings[0].value).toBe(1);
    expect(component.feelings[4].value).toBe(5);
  });
});
