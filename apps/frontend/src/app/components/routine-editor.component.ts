import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import {
  CdkDragDrop,
  moveItemInArray,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { Routine, Step } from '@flexicoach/shared';
import { RoutineService } from '../services/routine.service';
import { UploadService } from '../services/upload.service';
import { StepEditorModalComponent } from './step-editor-modal.component';

const MODE_META: Record<string, { color: string; bg: string; label: string }> =
  {
    mouvement: {
      color: 'var(--mode-mvt)',
      bg: 'rgba(59,130,246,0.10)',
      label: 'Mouvement',
    },
    statique: {
      color: 'var(--mode-resp)',
      bg: 'rgba(139,92,246,0.10)',
      label: 'Statique',
    },
    respiration: {
      color: '#0ea5e9',
      bg: 'rgba(14,165,233,0.10)',
      label: 'Respiration',
    },
  };

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
};

@Component({
  selector: 'app-routine-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule,
    StepEditorModalComponent,
  ],
  templateUrl: './routine-editor.component.html',
  styleUrls: ['./routine-editor.component.scss'],
})
export class RoutineEditorComponent implements OnInit {
  routineForm: FormGroup;
  loading = false;
  error = '';
  success = '';
  isEditMode = false;
  routineId = '';
  showStepModal = false;
  currentStepIndex: number | null = null;
  selectedStepIndex: number | null = null;

  uploadingStepIndex: number | null = null;

  constructor(
    private fb: FormBuilder,
    private routineService: RoutineService,
    private uploadService: UploadService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.routineForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      description: ['', Validators.maxLength(500)],
      tag: [''],
      category: ['', Validators.maxLength(50)],
      difficulty: ['beginner', Validators.required],
      icon: ['', Validators.maxLength(50)],
      steps: this.fb.array([]),
    });
  }

  ngOnInit() {
    // Check if we're in edit mode
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.routineId = params['id'];
        this.loadRoutine(this.routineId);
      }
    });
  }

  get steps(): FormArray {
    return this.routineForm.get('steps') as FormArray;
  }

  loadRoutine(id: string) {
    this.loading = true;
    this.routineService.getById(id).subscribe({
      next: (routine) => {
        this.routineForm.patchValue({
          name: routine.name,
          description: routine.description || '',
          tag: routine.tag || '',
          category: routine.level,
          difficulty: routine.level,
          icon: '',
        });

        // Clear existing steps and add routine steps
        this.steps.clear();
        routine.steps.forEach((step) => {
          // Strip any MongoDB _id fields that would be rejected by backend validation
          const cleanStep = {
            name: step.name,
            seconds: step.seconds,
            mode: step.mode,
            text: step.text,
            imageUrl: step.imageUrl,
            imageName: (step as any).imageName,
            imageSize: (step as any).imageSize,
            imageUploadedAt: (step as any).imageUploadedAt,
            cues: step.cues?.map((c: any) => ({ at: c.at, say: c.say })),
          };
          this.steps.push(this.createStepFormGroup(cleanStep));
        });

        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de la routine';
        this.loading = false;
        console.error('Error loading routine:', err);
      },
    });
  }

  createStepFormGroup(step?: Step): FormGroup {
    return this.fb.group({
      name: [
        step?.name || '',
        [Validators.required, Validators.maxLength(100)],
      ],
      seconds: [step?.seconds || 30, [Validators.required, Validators.min(5)]],
      mode: [step?.mode || 'mouvement', Validators.required],
      text: [step?.text || '', [Validators.required, Validators.minLength(1)]],
      imageUrl: [step?.imageUrl || ''],
      imageName: [step?.imageName || ''],
      imageSize: [step?.imageSize || 0],
      imageUploadedAt: [step?.imageUploadedAt || ''],
      cues: [step?.cues || []],
    });
  }

  openStepModal(index: number | null = null) {
    this.currentStepIndex = index;
    this.showStepModal = true;
  }

  closeStepModal() {
    this.showStepModal = false;
    this.currentStepIndex = null;
  }

  saveStep(stepData: Step) {
    if (this.currentStepIndex !== null) {
      // Edit existing step
      this.steps.at(this.currentStepIndex).patchValue(stepData);
    } else {
      // Add new step
      this.steps.push(this.createStepFormGroup(stepData));
    }
    this.closeStepModal();
  }

  deleteStep(index: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette étape ?')) {
      this.steps.removeAt(index);
    }
  }

  onDrop(event: CdkDragDrop<Step[]>) {
    const stepsArray = this.steps.controls;
    moveItemInArray(stepsArray, event.previousIndex, event.currentIndex);
    this.steps.setValue(stepsArray.map((control) => control.value));
  }

  getTotalDuration(): number {
    const steps = this.steps.value as Step[];
    return steps.reduce((acc, step) => acc + step.seconds, 0);
  }

  async onSubmit() {
    if (this.routineForm.invalid) {
      this.error = 'Veuillez remplir tous les champs obligatoires correctement';
      return;
    }

    if (this.steps.length === 0) {
      this.error = 'Vous devez ajouter au moins une étape';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const routineData = {
      ...this.routineForm.value,
    };

    const observable = this.isEditMode
      ? this.routineService.update(this.routineId, routineData)
      : this.routineService.create(routineData);

    observable.subscribe({
      next: (routine) => {
        this.success = this.isEditMode
          ? 'Routine modifiée avec succès'
          : 'Routine créée avec succès';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/routines']);
        }, 1500);
      },
      error: (err) => {
        this.error = 'Erreur lors de la sauvegarde de la routine';
        this.loading = false;
        console.error('Error saving routine:', err);
      },
    });
  }

  exportRoutine() {
    if (this.routineForm.invalid || this.steps.length === 0) {
      this.error = "Veuillez compléter la routine avant de l'exporter";
      return;
    }

    const exportData = {
      version: '1.0',
      routine: {
        ...this.routineForm.value,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.routineForm.value.name || 'routine'}.routine.json`;
    link.click();
    window.URL.revokeObjectURL(url);
    this.success = 'Routine exportée avec succès';
  }

  onImportFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // Validate file size (1 MB max)
    if (file.size > 1024 * 1024) {
      this.error = 'Le fichier est trop volumineux (limite : 1 MB)';
      return;
    }

    // Validate file extension
    if (!file.name.endsWith('.routine.json') && !file.name.endsWith('.json')) {
      this.error =
        'Format de fichier invalide. Utilisez un fichier .routine.json';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);

        // Support two formats:
        // 1. New format: {version: "1.0", routine: {...}}
        // 2. Legacy format: direct routine object {name, steps, ...}
        let routine;

        if (importData.version && importData.routine) {
          // New format with version wrapper
          if (importData.version !== '1.0') {
            this.error = `Version non supportée : ${importData.version}`;
            return;
          }
          routine = importData.routine;
        } else if (importData.name && importData.steps) {
          // Legacy format: direct routine object
          routine = importData;
        } else {
          this.error = 'Structure de fichier invalide';
          return;
        }

        // Helper function to strip MongoDB _id fields
        const stripMongoIds = (obj: any): any => {
          if (Array.isArray(obj)) {
            return obj.map((item) => stripMongoIds(item));
          } else if (obj && typeof obj === 'object') {
            const cleaned: any = {};
            for (const key in obj) {
              if (key !== '_id') {
                cleaned[key] = stripMongoIds(obj[key]);
              }
            }
            return cleaned;
          }
          return obj;
        };

        // Clean the routine data before loading into form
        routine = stripMongoIds(routine);

        // Load data into form
        this.routineForm.patchValue({
          name: routine.name || '',
          description: routine.description || '',
          tag: routine.tag || '',
          category: routine.category || '',
          difficulty: routine.difficulty || 'beginner',
          icon: routine.icon || '',
        });

        // Clear and add steps
        this.steps.clear();
        if (routine.steps && Array.isArray(routine.steps)) {
          routine.steps.forEach((step: Step) => {
            this.steps.push(this.createStepFormGroup(step));
          });
        }

        this.success = 'Routine importée avec succès';
        this.error = '';
      } catch (err) {
        this.error = 'Erreur lors de la lecture du fichier';
        console.error('Import error:', err);
      }
    };
    reader.readAsText(file);
  }

  cancel() {
    if (
      confirm(
        'Êtes-vous sûr de vouloir annuler ? Les modifications non sauvegardées seront perdues.',
      )
    ) {
      this.router.navigate(['/routines']);
    }
  }

  onStepImageUpload(event: Event, stepIndex: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
      this.error = 'Image trop volumineuse (max 5 MB)';
      return;
    }
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      this.error = 'Format non supporté. Utilisez JPEG, PNG ou WebP';
      return;
    }

    this.uploadingStepIndex = stepIndex;
    this.uploadService.uploadImage(file).subscribe({
      next: (result) => {
        this.steps.at(stepIndex).patchValue({
          imageUrl: result.imageUrl,
          imageName: result.originalName,
          imageSize: result.size,
          imageUploadedAt: new Date().toISOString(),
        });
        this.uploadingStepIndex = null;
        this.error = '';
      },
      error: () => {
        this.error = "Erreur lors de l'upload de l'image";
        this.uploadingStepIndex = null;
      },
    });

    // Reset input so the same file can be re-selected
    input.value = '';
  }

  removeStepImage(stepIndex: number): void {
    this.steps.at(stepIndex).patchValue({ imageUrl: '', imageName: '', imageSize: 0, imageUploadedAt: '' });
  }

  selectStep(index: number): void {
    this.selectedStepIndex = this.selectedStepIndex === index ? null : index;
  }

  getModeColor(mode: string): string {
    return MODE_META[mode]?.color ?? 'var(--ink-3)';
  }

  getModeColorBg(mode: string): string {
    return MODE_META[mode]?.bg ?? 'transparent';
  }

  getModeLabel(mode: string): string {
    return MODE_META[mode]?.label ?? mode;
  }

  getLevelLabel(difficulty: string): string {
    return LEVEL_LABELS[difficulty] ?? difficulty;
  }

  formatSeconds(s: number): string {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  get uniqueModesCount(): number {
    const modes = new Set(this.steps.controls.map((c) => c.get('mode')?.value));
    return modes.size;
  }

  get selectedStep() {
    if (this.selectedStepIndex === null) return null;
    return this.steps.at(this.selectedStepIndex)?.value ?? null;
  }

  get selectedStepFormGroup(): FormGroup | null {
    if (this.selectedStepIndex === null) return null;
    return this.steps.at(this.selectedStepIndex) as FormGroup ?? null;
  }

  /** Format upload date in short form (e.g. "12 avril") */
  formatUploadDate(isoDate: string): string {
    if (!isoDate) return '';
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return '';
    const months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  }

  /** Format file size in human-readable form */
  formatFileSize(bytes: number): string {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} o`;
    const ko = Math.round(bytes / 1024);
    if (ko < 1024) return `${ko} ko`;
    const mo = (bytes / (1024 * 1024)).toFixed(1);
    return `${mo} Mo`;
  }
}
