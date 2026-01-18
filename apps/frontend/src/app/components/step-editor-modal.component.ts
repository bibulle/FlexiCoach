import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Step } from '@flexicoach/shared';

@Component({
  selector: 'app-step-editor-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-editor-modal.component.html',
  styleUrls: ['./step-editor-modal.component.scss'],
})
export class StepEditorModalComponent implements OnInit, OnDestroy {
  @Input() step: Step | null = null;
  @Output() save = new EventEmitter<Step>();
  @Output() cancel = new EventEmitter<void>();

  stepForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.stepForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      seconds: [30, [Validators.required, Validators.min(5), Validators.max(300)]],
      mode: ['mouvement', Validators.required],
      text: ['', [Validators.required, Validators.minLength(1)]],
      cues: this.fb.array([]),
    });
  }

  ngOnInit() {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    if (this.step) {
      this.stepForm.patchValue({
        name: this.step.name,
        seconds: this.step.seconds,
        mode: this.step.mode,
        text: this.step.text,
      });

      // Load existing cues
      if (this.step.cues) {
        this.step.cues.forEach((cue) => {
          this.cues.push(this.createCueFormGroup(cue));
        });
      }
    }
  }

  ngOnDestroy() {
    // Restore body scroll when modal is closed
    document.body.style.overflow = '';
  }

  get cues(): FormArray {
    return this.stepForm.get('cues') as FormArray;
  }

  createCueFormGroup(cue?: { at: number; say: string }): FormGroup {
    return this.fb.group({
      at: [cue?.at || 0, [Validators.required, Validators.min(0)]],
      say: [cue?.say || '', [Validators.required, Validators.minLength(1)]],
    });
  }

  addCue() {
    this.cues.push(this.createCueFormGroup());
  }

  removeCue(index: number) {
    this.cues.removeAt(index);
  }

  onSave() {
    if (this.stepForm.valid) {
      const maxSeconds = this.stepForm.value.seconds;

      // Validate cues are within step duration
      const cues = this.cues.value;
      const invalidCues = cues.filter((cue: { at: number }) => cue.at > maxSeconds);

      if (invalidCues.length > 0) {
        alert(`Les cues ne peuvent pas dépasser la durée de l'étape (${maxSeconds}s)`);
        return;
      }

      // Sort cues by timestamp
      cues.sort((a: { at: number }, b: { at: number }) => a.at - b.at);

      this.save.emit({
        ...this.stepForm.value,
        cues,
      });
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
