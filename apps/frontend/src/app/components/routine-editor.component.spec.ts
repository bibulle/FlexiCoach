import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  RoutineEditorComponent,
  stepCuesValidator,
} from './routine-editor.component';
import { RoutineService } from '../services/routine.service';
import { Routine } from '@flexicoach/shared';
import { safeDetectChanges } from '../../test-utils';

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

  describe('Issue #146: a single way to edit a step (detail panel)', () => {
    const el = () => fixture.nativeElement as HTMLElement;
    const input = (selector: string) =>
      el().querySelector(selector) as HTMLInputElement;
    const type = (selector: string, value: string, index = 0) => {
      const field = el().querySelectorAll(selector)[index] as HTMLInputElement;
      field.value = value;
      field.dispatchEvent(new Event('input'));
      safeDetectChanges(fixture);
    };
    const addValidStep = (
      name = 'Chat-vache',
      seconds = 30,
      cues: any[] = [],
    ) =>
      component.steps.push(
        component.createStepFormGroup({
          name,
          seconds,
          mode: 'mouvement',
          text: 'Consigne',
          cues,
        }),
      );

    beforeEach(() => {
      safeDetectChanges(fixture);
    });

    describe('entry points', () => {
      it('should not render the legacy step modal nor its "…" button', () => {
        addValidStep();
        safeDetectChanges(fixture);

        expect(el().querySelector('app-step-editor-modal')).toBeNull();
        expect(el().querySelector('.modal-overlay')).toBeNull();
        expect(
          el().querySelector('.editor-step button[aria-label="Éditer"]'),
        ).toBeNull();
        // The only buttons left in a step card would open another editor
        expect(el().querySelectorAll('.editor-step button').length).toBe(0);
        expect((component as any).openStepModal).toBeUndefined();
      });

      it('should open the panel when a step card is clicked', () => {
        addValidStep('Planche');
        safeDetectChanges(fixture);
        expect(el().querySelector('.editor-panel-empty')).toBeTruthy();

        (el().querySelector('.editor-step') as HTMLElement).click();
        safeDetectChanges(fixture);

        expect(component.selectedStepIndex).toBe(0);
        expect(input('#step-name').value).toBe('Planche');
        expect(
          el()
            .querySelector('.editor-panel')
            ?.classList.contains('editor-panel--open'),
        ).toBe(true);
      });

      it('should make step cards usable with the keyboard', () => {
        addValidStep('Planche');
        safeDetectChanges(fixture);
        const card = el().querySelector('.editor-step') as HTMLElement;

        expect(card.getAttribute('tabindex')).toBe('0');
        expect(card.getAttribute('role')).toBe('button');
        expect(card.getAttribute('aria-label')).toContain('Planche');

        card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        safeDetectChanges(fixture);
        expect(component.selectedStepIndex).toBe(0);
        expect(card.getAttribute('aria-pressed')).toBe('true');
      });

      it('should close the panel with the "Terminé" button (mobile sheet)', () => {
        addValidStep();
        component.selectStep(0);
        safeDetectChanges(fixture);

        (el().querySelector('.editor-panel-close') as HTMLElement).click();
        safeDetectChanges(fixture);

        expect(component.selectedStepIndex).toBeNull();
        expect(
          el()
            .querySelector('.editor-panel')
            ?.classList.contains('editor-panel--open'),
        ).toBe(false);
        // The step itself is kept
        expect(component.steps.length).toBe(1);
      });
    });

    describe('adding a step', () => {
      it('should add an empty step and select it in the panel', () => {
        (el().querySelector('.editor-add-btn') as HTMLElement).click();
        safeDetectChanges(fixture);

        expect(component.steps.length).toBe(1);
        expect(component.selectedStepIndex).toBe(0);
        expect(component.steps.at(0).value).toMatchObject({
          name: '',
          seconds: 30,
          mode: 'mouvement',
          text: '',
          cues: [],
        });
        expect(input('#step-name')).toBeTruthy();
        expect(
          el().querySelector('.editor-panel-title')?.textContent,
        ).toContain('Nouvelle étape');
      });

      it('should select the new step even when another one was selected', () => {
        addValidStep('A');
        component.selectStep(0);

        component.addStep();

        expect(component.steps.length).toBe(2);
        expect(component.selectedStepIndex).toBe(1);
      });

      it('should flag the new step as incomplete until name and instruction are filled', () => {
        component.addStep();
        safeDetectChanges(fixture);

        expect(component.routineForm.invalid).toBe(true);
        expect(
          el()
            .querySelector('.editor-step')
            ?.classList.contains('editor-step--invalid'),
        ).toBe(true);
        expect(el().querySelector('.step-incomplete')?.textContent).toContain(
          'À compléter',
        );

        type('#step-name', 'Gainage');
        type('#step-text', 'Corps aligné');

        expect(component.steps.at(0).valid).toBe(true);
        expect(el().querySelector('.step-incomplete')).toBeNull();
        expect(el().querySelector('.step-name')?.textContent).toContain(
          'Gainage',
        );
      });

      it('should show field errors once the required fields were visited', () => {
        component.addStep();
        safeDetectChanges(fixture);
        expect(
          el().querySelectorAll('.editor-panel .editor-field-error').length,
        ).toBe(0);

        component.steps.at(0).get('name')?.markAsTouched();
        component.steps.at(0).get('text')?.markAsTouched();
        component.steps.at(0).get('seconds')?.setValue(2);
        safeDetectChanges(fixture);

        const errors = Array.from(
          el().querySelectorAll('.editor-panel .editor-field-error'),
        ).map((e) => e.textContent?.trim());
        expect(errors).toEqual([
          'Le nom est requis (100 caractères maximum)',
          "La durée doit être d'au moins 5 secondes",
          'La consigne est requise',
        ]);
      });
    });

    describe('selection kept consistent', () => {
      beforeEach(() => {
        addValidStep('A');
        addValidStep('B');
        addValidStep('C');
        vi.spyOn(window, 'confirm').mockReturnValue(true);
      });

      it('should clear the selection when the selected step is deleted', () => {
        component.selectStep(1);
        component.deleteStep(1);

        expect(component.steps.length).toBe(2);
        expect(component.selectedStepIndex).toBeNull();
      });

      it('should keep the same step selected when a previous one is deleted', () => {
        component.selectStep(2);
        component.deleteStep(0);

        expect(component.selectedStepIndex).toBe(1);
        expect(component.selectedStep?.name).toBe('C');
      });

      it('should not touch the selection when a later step is deleted', () => {
        component.selectStep(0);
        component.deleteStep(2);

        expect(component.selectedStepIndex).toBe(0);
        expect(component.selectedStep?.name).toBe('A');
      });

      it('should keep everything when the deletion is not confirmed', () => {
        (window.confirm as any).mockReturnValue(false);
        component.selectStep(1);
        component.deleteStep(1);

        expect(component.steps.length).toBe(3);
        expect(component.selectedStepIndex).toBe(1);
      });

      it('should follow the selected step when steps are reordered', () => {
        component.selectStep(0);
        component.onDrop({ previousIndex: 0, currentIndex: 2 } as any);

        expect(component.steps.value.map((s: any) => s.name)).toEqual([
          'B',
          'C',
          'A',
        ]);
        expect(component.selectedStepIndex).toBe(2);
        expect(component.selectedStep?.name).toBe('A');
      });

      it('should reorder without selection', () => {
        component.onDrop({ previousIndex: 2, currentIndex: 0 } as any);

        expect(component.steps.value.map((s: any) => s.name)).toEqual([
          'C',
          'A',
          'B',
        ]);
        expect(component.selectedStepIndex).toBeNull();
      });
    });

    describe('voice cues edited in the panel', () => {
      beforeEach(() => {
        addValidStep('Planche', 30);
        component.selectStep(0);
        safeDetectChanges(fixture);
      });

      it('should show a hint when the step has no cue', () => {
        expect(el().querySelector('.editor-cues-empty')).toBeTruthy();
        expect(el().querySelectorAll('.editor-cue').length).toBe(0);
      });

      it('should add a cue from the panel', () => {
        (el().querySelector('.editor-cues-add-btn') as HTMLElement).click();
        safeDetectChanges(fixture);

        expect(component.steps.at(0).value.cues).toEqual([{ at: 0, say: '' }]);
        expect(el().querySelectorAll('.editor-cue').length).toBe(1);
        expect(el().querySelector('.editor-cues-empty')).toBeNull();
        expect(component.steps.at(0).get('cues')?.dirty).toBe(true);
      });

      it('should edit the moment and the text of a cue', () => {
        component.addCue(0);
        safeDetectChanges(fixture);

        type('.editor-cue-at', '15');
        type('.editor-cue-say', 'Mi-parcours');

        expect(component.steps.at(0).value.cues).toEqual([
          { at: 15, say: 'Mi-parcours' },
        ]);
        expect(component.steps.at(0).valid).toBe(true);
      });

      it('should edit the right cue when there are several', () => {
        component.addCue(0);
        component.addCue(0);
        safeDetectChanges(fixture);

        type('.editor-cue-say', 'Deuxième', 1);
        type('.editor-cue-at', '20', 1);

        expect(component.steps.at(0).value.cues).toEqual([
          { at: 0, say: '' },
          { at: 20, say: 'Deuxième' },
        ]);
      });

      it('should remove a cue', () => {
        component.steps.at(0).patchValue({
          cues: [
            { at: 5, say: 'Un' },
            { at: 10, say: 'Deux' },
          ],
        });
        safeDetectChanges(fixture);

        (el().querySelectorAll('.editor-cue-remove')[0] as HTMLElement).click();
        safeDetectChanges(fixture);

        expect(component.steps.at(0).value.cues).toEqual([
          { at: 10, say: 'Deux' },
        ]);
        expect(el().querySelectorAll('.editor-cue').length).toBe(1);
      });

      it('should reject a cue without text', () => {
        component.addCue(0);
        safeDetectChanges(fixture);

        expect(component.steps.at(0).hasError('cueTextRequired')).toBe(true);
        expect(component.routineForm.invalid).toBe(true);
        expect(
          el().querySelector('.editor-cues-section')?.textContent,
        ).toContain('Chaque annonce doit avoir un texte');
      });

      it('should reject a cue after the end of the step', () => {
        component.addCue(0);
        safeDetectChanges(fixture);
        type('.editor-cue-say', 'Trop tard');
        type('.editor-cue-at', '31');

        expect(component.steps.at(0).hasError('cueOutOfRange')).toBe(true);
        expect(
          el().querySelector('.editor-cues-section')?.textContent,
        ).toContain('(30 s)');

        type('.editor-cue-at', '30');
        expect(component.steps.at(0).valid).toBe(true);
      });

      it('should reject an empty or negative moment', () => {
        component.addCue(0);
        safeDetectChanges(fixture);
        type('.editor-cue-say', 'Go');

        type('.editor-cue-at', '');
        expect(component.steps.at(0).value.cues[0].at).toBeNull();
        expect(component.steps.at(0).hasError('cueOutOfRange')).toBe(true);

        type('.editor-cue-at', '-1');
        expect(component.steps.at(0).hasError('cueOutOfRange')).toBe(true);
      });

      it('should invalidate existing cues when the step gets shorter', () => {
        component.steps.at(0).patchValue({ cues: [{ at: 25, say: 'Fin' }] });
        expect(component.steps.at(0).valid).toBe(true);

        component.steps.at(0).patchValue({ seconds: 20 });

        expect(component.steps.at(0).hasError('cueOutOfRange')).toBe(true);
      });

      it('should handle many cues (issue #33)', () => {
        for (let i = 0; i < 12; i++) component.addCue(0);
        safeDetectChanges(fixture);

        expect(el().querySelectorAll('.editor-cue').length).toBe(12);
        expect(el().querySelectorAll('.editor-cue-say').length).toBe(12);
      });
    });

    describe('stepCuesValidator', () => {
      const validate = (seconds: number, cues: any[]) =>
        stepCuesValidator(
          component.createStepFormGroup({
            name: 'A',
            seconds,
            mode: 'mouvement',
            text: 'x',
            cues,
          }),
        );

      it('should accept a step without cues', () => {
        expect(validate(30, [])).toBeNull();
      });

      it('should accept cues at the very start and the very end', () => {
        expect(
          validate(30, [
            { at: 0, say: 'Début' },
            { at: 30, say: 'Fin' },
          ]),
        ).toBeNull();
      });

      it('should report a blank text', () => {
        expect(validate(30, [{ at: 5, say: '   ' }])).toEqual({
          cueTextRequired: true,
        });
      });

      it('should report both problems at once', () => {
        expect(validate(30, [{ at: 99, say: '' }])).toEqual({
          cueTextRequired: true,
          cueOutOfRange: true,
        });
      });
    });

    describe('saving', () => {
      beforeEach(() => {
        component.routineForm.patchValue({ name: 'Ma routine' });
        mockRoutineService.create.mockReturnValue(of({} as Routine));
      });

      it('should save a step created and filled in the panel', () => {
        component.addStep();
        safeDetectChanges(fixture);
        type('#step-name', 'Gainage');
        type('#step-seconds', '45');
        type('#step-text', 'Corps aligné');
        component.addCue(0);
        safeDetectChanges(fixture);
        type('.editor-cue-at', '20');
        type('.editor-cue-say', 'Tiens bon');

        component.onSubmit();

        expect(mockRoutineService.create).toHaveBeenCalledTimes(1);
        const payload = mockRoutineService.create.mock.calls[0][0];
        expect(payload.steps).toHaveLength(1);
        expect(payload.steps[0]).toMatchObject({
          name: 'Gainage',
          seconds: 45,
          mode: 'mouvement',
          text: 'Corps aligné',
          cues: [{ at: 20, say: 'Tiens bon' }],
        });
      });

      it('should sort the cues by moment when saving', () => {
        addValidStep('Planche', 60, [
          { at: 40, say: 'Trois' },
          { at: 5, say: 'Un' },
          { at: 20, say: 'Deux' },
        ]);

        component.onSubmit();

        expect(
          mockRoutineService.create.mock.calls[0][0].steps[0].cues,
        ).toEqual([
          { at: 5, say: 'Un' },
          { at: 20, say: 'Deux' },
          { at: 40, say: 'Trois' },
        ]);
        // The order shown in the panel is not changed while editing
        expect(component.steps.at(0).value.cues[0].say).toBe('Trois');
      });

      it('should not save while a step is incomplete', () => {
        component.addStep();

        component.onSubmit();

        expect(mockRoutineService.create).not.toHaveBeenCalled();
        expect(component.error).toContain('champs obligatoires');
      });

      it('should not save while a cue is invalid', () => {
        addValidStep('Planche', 30, [{ at: 45, say: 'Hors durée' }]);

        component.onSubmit();

        expect(mockRoutineService.create).not.toHaveBeenCalled();
      });

      it('should disable the save button while a step is incomplete', () => {
        component.addStep();
        safeDetectChanges(fixture);

        const save = el().querySelector(
          '.editor-toolbar .btn-primary',
        ) as HTMLButtonElement;
        expect(save.disabled).toBe(true);
      });
    });

    it('should clear the selection when a routine is imported', () => {
      addValidStep('A');
      component.selectStep(0);
      const file = new File(
        [
          JSON.stringify({
            name: 'Importée',
            steps: [
              { name: 'S1', seconds: 20, mode: 'statique', text: 't' },
              { name: 'S2', seconds: 20, mode: 'statique', text: 't' },
            ],
          }),
        ],
        'r.routine.json',
        { type: 'application/json' },
      );
      const reader: any = {
        readAsText: vi.fn(function (this: any) {
          this.onload({
            target: {
              result: JSON.stringify({
                name: 'Importée',
                steps: [
                  { name: 'S1', seconds: 20, mode: 'statique', text: 't' },
                  { name: 'S2', seconds: 20, mode: 'statique', text: 't' },
                ],
              }),
            },
          });
        }),
      };
      vi.stubGlobal(
        'FileReader',
        vi.fn(function () {
          return reader;
        }),
      );

      try {
        component.onImportFile({ target: { files: [file] } } as any);
      } finally {
        vi.unstubAllGlobals();
      }

      expect(component.steps.length).toBe(2);
      expect(component.selectedStepIndex).toBeNull();
    });
  });

  describe('Issue #173: step image that cannot be loaded', () => {
    const el = () => fixture.nativeElement as HTMLElement;
    const thumb = () =>
      el().querySelector('.editor-image-thumb img') as HTMLImageElement | null;

    beforeEach(() => {
      fixture.detectChanges();
      component.steps.push(
        component.createStepFormGroup({
          name: 'Planche',
          seconds: 30,
          mode: 'statique',
          text: 'Tiens',
          imageUrl: '/uploads/perdue.png',
          imageName: 'planche.png',
        }),
      );
      component.selectStep(0);
      safeDetectChanges(fixture);
    });

    it('should show the thumbnail of the step image', () => {
      expect(thumb()?.getAttribute('src')).toBe('/uploads/perdue.png');
      expect(el().querySelector('.editor-image-missing')).toBeNull();
    });

    it('should say the image is missing instead of showing a broken picture', () => {
      thumb()!.dispatchEvent(new Event('error'));
      safeDetectChanges(fixture);

      expect(thumb()).toBeNull();
      expect(
        el().querySelector('.editor-image-missing')?.textContent,
      ).toContain('Image introuvable');
      // The step keeps its reference: the user decides to replace or remove it
      expect(component.steps.at(0).value.imageUrl).toBe('/uploads/perdue.png');
      expect(el().querySelector('.editor-image-replace-btn')).toBeTruthy();
      expect(el().querySelector('.editor-image-remove-btn')).toBeTruthy();
    });

    it('should show the new image after a replacement', () => {
      thumb()!.dispatchEvent(new Event('error'));
      component.steps.at(0).patchValue({ imageUrl: '/uploads/nouvelle.png' });
      safeDetectChanges(fixture);

      expect(thumb()?.getAttribute('src')).toBe('/uploads/nouvelle.png');
      expect(el().querySelector('.editor-image-missing')).toBeNull();
    });

    it('should go back to the dropzone when the missing image is removed', () => {
      thumb()!.dispatchEvent(new Event('error'));
      component.removeStepImage(0);
      safeDetectChanges(fixture);

      expect(el().querySelector('.editor-image-missing')).toBeNull();
      expect(el().querySelector('.editor-image-dropzone')).toBeTruthy();
    });

    it('should ignore an error without image URL', () => {
      component.onImageError(undefined);

      expect(component.isImageMissing(undefined)).toBe(false);
      expect(component.isImageMissing('/uploads/perdue.png')).toBe(false);
    });
  });
});
