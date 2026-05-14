import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RoutineEditorComponent } from './routine-editor.component';
import { RoutineService } from '../services/routine.service';
import { Routine } from '@flexicoach/shared';

describe('RoutineEditorComponent', () => {
  let component: RoutineEditorComponent;
  let fixture: ComponentFixture<RoutineEditorComponent>;
  let mockRoutineService: any;
  let mockActivatedRoute: any;
  let router: Router;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(async () => {
    mockRoutineService = {
      create: vi.fn(),
      update: vi.fn(),
      getById: vi.fn(),
    };

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: vi.fn(() => null),
        },
      },
      params: of({}),
    };

    await TestBed.configureTestingModule({
      imports: [
        RoutineEditorComponent,
        ReactiveFormsModule,
        RouterTestingModule,
      ],
      providers: [
        provideHttpClient(),
        { provide: RoutineService, useValue: mockRoutineService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');

    fixture = TestBed.createComponent(RoutineEditorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    fixture.detectChanges();

    expect(component.routineForm.get('name')?.value).toBe('');
    expect(component.routineForm.get('description')?.value).toBe('');
    expect(component.steps.length).toBe(0);
  });

  describe('Issue #34: MongoDB _id stripping on import', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should strip _id fields from imported routine data', () => {
      const importData = {
        version: '1.0',
        routine: {
          _id: 'routine-mongo-id',
          name: 'Test Routine',
          description: 'Test description',
          category: 'fitness',
          difficulty: 'beginner',
          icon: 'icon',
          steps: [
            {
              _id: 'step-mongo-id-1',
              name: 'Step 1',
              seconds: 30,
              mode: 'mouvement',
              text: 'Test step',
              cues: [
                { _id: 'cue-id-1', at: 10, say: 'Halfway' },
                { _id: 'cue-id-2', at: 20, say: 'Almost done' },
              ],
            },
            {
              _id: 'step-mongo-id-2',
              name: 'Step 2',
              seconds: 45,
              mode: 'statique',
              text: 'Another step',
              cues: [{ _id: 'cue-id-3', at: 15, say: 'Keep going' }],
            },
          ],
        },
      };

      const blob = new Blob([JSON.stringify(importData)], {
        type: 'application/json',
      });
      const file = new File([blob], 'test.routine.json', {
        type: 'application/json',
      });

      // Mock FileReader: readAsText triggers onload synchronously
      // (the component sets reader.onload before calling reader.readAsText)
      const mockFileReader: any = {
        readAsText: vi.fn(function () {
          mockFileReader.onload({
            target: { result: JSON.stringify(importData) },
          });
        }),
        onload: null as any,
      };
      vi.stubGlobal('FileReader', function () {
        return mockFileReader;
      });

      fixture.detectChanges();

      const event = {
        target: {
          files: [file],
        },
      } as any;

      component.onImportFile(event);

      // Assertions are synchronous — onload was triggered immediately by readAsText
      expect(component.routineForm.get('name')?.value).toBe('Test Routine');
      expect(component.steps.length).toBe(2);

      // Verify _id fields are NOT in the form data
      const formValue = component.routineForm.value;
      expect(formValue._id).toBeUndefined();

      const step1 = component.steps.at(0).value;
      expect(step1._id).toBeUndefined();
      expect(step1.name).toBe('Step 1');

      const step1Cues = component.steps.at(0).get('cues')?.value;
      expect(step1Cues[0]._id).toBeUndefined();
      expect(step1Cues[0].at).toBe(10);
      expect(step1Cues[0].say).toBe('Halfway');

      const step2 = component.steps.at(1).value;
      expect(step2._id).toBeUndefined();
      expect(step2.name).toBe('Step 2');
    });

    it('should preserve all non-_id fields during import', () => {
      const importData = {
        version: '1.0',
        routine: {
          _id: 'routine-id',
          name: 'Test Routine',
          description: 'Description',
          category: 'category',
          difficulty: 'intermediate',
          icon: 'test-icon',
          steps: [
            {
              _id: 'step-id',
              name: 'Step Name',
              seconds: 60,
              mode: 'respiration',
              text: 'Instructions',
              cues: [{ _id: 'cue-id', at: 30, say: 'Breathe' }],
            },
          ],
        },
      };

      const blob = new Blob([JSON.stringify(importData)], {
        type: 'application/json',
      });
      const file = new File([blob], 'test.routine.json');

      const mockFileReader: any = {
        readAsText: vi.fn(function () {
          mockFileReader.onload({
            target: { result: JSON.stringify(importData) },
          });
        }),
        onload: null as any,
      };
      vi.stubGlobal('FileReader', function () {
        return mockFileReader;
      });

      fixture.detectChanges();

      const event = { target: { files: [file] } } as any;
      component.onImportFile(event);

      // All fields should be preserved
      expect(component.routineForm.get('name')?.value).toBe('Test Routine');
      expect(component.routineForm.get('description')?.value).toBe(
        'Description',
      );
      expect(component.routineForm.get('category')?.value).toBe('category');
      expect(component.routineForm.get('difficulty')?.value).toBe(
        'intermediate',
      );
      expect(component.routineForm.get('icon')?.value).toBe('test-icon');

      const step = component.steps.at(0).value;
      expect(step.name).toBe('Step Name');
      expect(step.seconds).toBe(60);
      expect(step.mode).toBe('respiration');
      expect(step.text).toBe('Instructions');

      const cue = step.cues[0];
      expect(cue.at).toBe(30);
      expect(cue.say).toBe('Breathe');
    });

    it('should handle legacy format without _id fields', () => {
      const legacyData = {
        name: 'Legacy Routine',
        description: 'Legacy description',
        steps: [
          {
            name: 'Legacy Step',
            seconds: 30,
            mode: 'mouvement',
            text: 'Legacy text',
            cues: [],
          },
        ],
      };

      const blob = new Blob([JSON.stringify(legacyData)], {
        type: 'application/json',
      });
      const file = new File([blob], 'legacy.routine.json');

      const mockFileReader: any = {
        readAsText: vi.fn(function () {
          mockFileReader.onload({
            target: { result: JSON.stringify(legacyData) },
          });
        }),
        onload: null as any,
      };
      vi.stubGlobal('FileReader', function () {
        return mockFileReader;
      });

      fixture.detectChanges();

      const event = { target: { files: [file] } } as any;
      component.onImportFile(event);

      expect(component.routineForm.get('name')?.value).toBe('Legacy Routine');
      expect(component.steps.length).toBe(1);
    });
  });

  it('should export routine correctly', () => {
    fixture.detectChanges();

    component.routineForm.patchValue({
      name: 'Export Test',
      description: 'Test export',
      category: 'test',
      difficulty: 'beginner',
      icon: 'test-icon',
    });

    // Add at least one step for valid export
    const stepGroup = component.createStepFormGroup({
      name: 'Test Step',
      seconds: 30,
      mode: 'mouvement',
      text: 'Test instruction',
      cues: [],
    });
    component.steps.push(stepGroup);

    // Mock URL.createObjectURL and link click
    const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
    const mockRevokeObjectURL = vi.fn();
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;

    URL.createObjectURL = mockCreateObjectURL;
    URL.revokeObjectURL = mockRevokeObjectURL;

    const mockLink = document.createElement('a');
    const clickSpy = vi.spyOn(mockLink, 'click');
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

    try {
      component.exportRoutine();

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockLink.download).toContain('.routine.json');
      expect(clickSpy).toHaveBeenCalled();
    } finally {
      // Restore original functions
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
    }
  });

  describe('selectStep / getModeColor / formatSeconds', () => {
    it('should select a step by index', () => {
      fixture.detectChanges();
      component.steps.push(
        component.createStepFormGroup({
          name: 'A',
          seconds: 60,
          mode: 'mouvement',
          text: 'x',
          cues: [],
        }),
      );
      component.selectStep(0);
      expect(component.selectedStepIndex).toBe(0);
    });

    it('should deselect step when same index clicked again', () => {
      fixture.detectChanges();
      component.steps.push(
        component.createStepFormGroup({
          name: 'A',
          seconds: 60,
          mode: 'mouvement',
          text: 'x',
          cues: [],
        }),
      );
      component.selectStep(0);
      component.selectStep(0);
      expect(component.selectedStepIndex).toBeNull();
    });

    it('should return selectedStep matching selected index', () => {
      fixture.detectChanges();
      component.steps.push(
        component.createStepFormGroup({
          name: 'A',
          seconds: 60,
          mode: 'mouvement',
          text: 'x',
          cues: [],
        }),
      );
      component.selectStep(0);
      expect(component.selectedStep?.name).toBe('A');
    });

    it('should return null selectedStep when nothing selected', () => {
      expect(component.selectedStep).toBeNull();
    });

    it('should return mode color for mouvement', () => {
      expect(component.getModeColor('mouvement')).toBe('var(--mode-mvt)');
    });

    it('should return mode color for statique', () => {
      expect(component.getModeColor('statique')).toBe('var(--mode-resp)');
    });

    it('should return mode color for respiration', () => {
      expect(component.getModeColor('respiration')).toBe('#0ea5e9');
    });

    it('should return fallback color for unknown mode', () => {
      expect(component.getModeColor('unknown')).toBe('var(--ink-3)');
    });

    it('should return correct mode label', () => {
      expect(component.getModeLabel('mouvement')).toBe('Mouvement');
      expect(component.getModeLabel('statique')).toBe('Statique');
      expect(component.getModeLabel('respiration')).toBe('Respiration');
    });

    it('should format seconds correctly', () => {
      expect(component.formatSeconds(60)).toBe('1:00');
      expect(component.formatSeconds(90)).toBe('1:30');
      expect(component.formatSeconds(0)).toBe('0:00');
      expect(component.formatSeconds(125)).toBe('2:05');
    });

    it('should count unique modes', () => {
      fixture.detectChanges();
      component.steps.push(
        component.createStepFormGroup({
          name: 'A',
          seconds: 60,
          mode: 'mouvement',
          text: 'x',
          cues: [],
        }),
      );
      component.steps.push(
        component.createStepFormGroup({
          name: 'B',
          seconds: 90,
          mode: 'statique',
          text: 'y',
          cues: [],
        }),
      );
      expect(component.uniqueModesCount).toBe(2);
    });

    it('should return level label', () => {
      expect(component.getLevelLabel('beginner')).toBe('Débutant');
      expect(component.getLevelLabel('intermediate')).toBe('Intermédiaire');
      expect(component.getLevelLabel('advanced')).toBe('Avancé');
    });
  });
});
