import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { StepEditorModalComponent } from './step-editor-modal.component';
import { Step } from '@flexicoach/shared';

describe('StepEditorModalComponent', () => {
  let component: StepEditorModalComponent;
  let fixture: ComponentFixture<StepEditorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepEditorModalComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(StepEditorModalComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    // Cleanup body overflow
    document.body.style.overflow = '';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    fixture.detectChanges();

    expect(component.stepForm.get('name')?.value).toBe('');
    expect(component.stepForm.get('seconds')?.value).toBe(30);
    expect(component.stepForm.get('mode')?.value).toBe('mouvement');
    expect(component.stepForm.get('text')?.value).toBe('');
    expect(component.cues.length).toBe(0);
  });

  it('should prevent body scroll when modal opens', () => {
    fixture.detectChanges();

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should restore body scroll when modal closes', () => {
    fixture.detectChanges();
    fixture.destroy();

    expect(document.body.style.overflow).toBe('');
  });

  it('should load existing step data when provided', () => {
    const existingStep: Step = {
      name: 'Test Step',
      seconds: 60,
      mode: 'statique',
      text: 'Test instructions',
      cues: [
        { at: 10, say: 'Halfway' },
        { at: 20, say: 'Almost done' },
      ],
    };

    component.step = existingStep;
    fixture.detectChanges();

    expect(component.stepForm.get('name')?.value).toBe('Test Step');
    expect(component.stepForm.get('seconds')?.value).toBe(60);
    expect(component.stepForm.get('mode')?.value).toBe('statique');
    expect(component.stepForm.get('text')?.value).toBe('Test instructions');
    expect(component.cues.length).toBe(2);
  });

  it('should add a new cue', () => {
    fixture.detectChanges();

    component.addCue();

    expect(component.cues.length).toBe(1);
    expect(component.cues.at(0).get('at')?.value).toBe(0);
    expect(component.cues.at(0).get('say')?.value).toBe('');
  });

  it('should remove a cue', () => {
    fixture.detectChanges();

    component.addCue();
    component.addCue();
    expect(component.cues.length).toBe(2);

    component.removeCue(0);
    expect(component.cues.length).toBe(1);
  });

  it('should emit save event with form data when valid', () => {
    fixture.detectChanges();

    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);

    component.stepForm.patchValue({
      name: 'New Step',
      seconds: 45,
      mode: 'respiration',
      text: 'Breathe deeply',
    });

    component.onSave();

    expect(saveSpy).toHaveBeenCalledWith({
      name: 'New Step',
      seconds: 45,
      mode: 'respiration',
      text: 'Breathe deeply',
      cues: [],
    });
  });

  it('should not emit save event when form is invalid', () => {
    fixture.detectChanges();

    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);

    component.stepForm.patchValue({
      name: '', // Invalid - required
      seconds: 45,
      mode: 'respiration',
      text: 'Breathe deeply',
    });

    component.onSave();

    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('should emit cancel event', () => {
    fixture.detectChanges();

    const cancelSpy = vi.fn();
    component.cancel.subscribe(cancelSpy);

    component.onCancel();

    expect(cancelSpy).toHaveBeenCalled();
  });

  describe('Issue #33: Modal scroll with multiple cues', () => {
    it('should handle multiple cues without errors', () => {
      fixture.detectChanges();

      // Add 8 cues to simulate overflow scenario
      for (let i = 0; i < 8; i++) {
        component.addCue();
      }

      expect(component.cues.length).toBe(8);
      expect(component.stepForm.valid).toBe(false); // Form needs name and text
    });

    it('should maintain form validity with multiple cues', () => {
      fixture.detectChanges();

      component.stepForm.patchValue({
        name: 'Multi-cue Step',
        seconds: 60,
        mode: 'mouvement',
        text: 'Complex instructions',
      });

      // Add and fill 8 cues
      for (let i = 0; i < 8; i++) {
        component.addCue();
        component.cues.at(i).patchValue({
          at: i * 5,
          say: `Cue ${i}`,
        });
      }

      expect(component.stepForm.valid).toBe(true);
      expect(component.cues.length).toBe(8);
    });
  });
});
