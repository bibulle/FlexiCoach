import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Routine, Step } from '@flexicoach/shared';
import { RoutineService } from '../services/routine.service';
import { SessionService } from '../services/session.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-routine-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './routine-player.component.html',
  styleUrls: ['./routine-player.component.scss'],
})
export class RoutinePlayerComponent implements OnInit, OnDestroy {
  routine: Routine | null = null;
  currentStepIndex = 0;
  timeLeft = 0;
  isResting = false;
  isPlaying = false;
  totalSeconds = 0;
  startTime: Date | null = null;

  private interval: any = null;
  private synth = window.speechSynthesis;
  private audioContext: AudioContext | null = null;
  private voicesLoaded = false;
  private wakeLock: WakeLockSentinel | null = null;
  private visibilityHandler: (() => void) | null = null;

  readonly REST_SECONDS = 10;

  readonly MODE_COLORS: Record<string, string> = {
    mouvement: 'var(--primary-500)',
    statique: 'var(--mode-stat)',
    respiration: 'var(--mode-resp)',
  };

  readonly MODE_LABELS: Record<string, string> = {
    mouvement: 'Mouvement',
    statique: 'Statique',
    respiration: 'Respiration',
  };

  get upcomingStep(): Step | null {
    if (!this.routine) return null;
    const nextIdx = this.isResting
      ? this.currentStepIndex
      : this.currentStepIndex + 1;
    return this.routine.steps[nextIdx] ?? null;
  }

  get modeLegend(): {
    mode: string;
    label: string;
    color: string;
    count: number;
  }[] {
    if (!this.routine) return [];
    return Object.entries(this.MODE_LABELS)
      .map(([mode, label]) => ({
        mode,
        label,
        color: this.MODE_COLORS[mode],
        count: this.routine!.steps.filter((s) => s.mode === mode).length,
      }))
      .filter((e) => e.count > 0);
  }

  getModeColor(mode: string): string {
    return this.MODE_COLORS[mode] ?? 'var(--primary-500)';
  }

  getModeLabel(mode: string): string {
    return this.MODE_LABELS[mode] ?? mode;
  }

  getTimelineSegments(): {
    flex: number;
    color: string;
    status: 'done' | 'current' | 'todo';
    progress: number;
  }[] {
    if (!this.routine) return [];
    return this.routine.steps.map((step, i) => {
      let status: 'done' | 'current' | 'todo';
      if (this.isResting) {
        status = i < this.currentStepIndex ? 'done' : 'todo';
      } else {
        status =
          i < this.currentStepIndex
            ? 'done'
            : i === this.currentStepIndex
              ? 'current'
              : 'todo';
      }
      const elapsed = status === 'current' ? step.seconds - this.timeLeft : 0;
      const progress =
        status === 'current' && step.seconds > 0 ? elapsed / step.seconds : 0;
      return {
        flex: step.seconds,
        color: this.getModeColor(step.mode),
        status,
        progress,
      };
    });
  }

  previousStep() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isResting = false;
    if (this.currentStepIndex > 0) this.currentStepIndex--;
    this.startStep();
    if (this.isPlaying) {
      this.interval = setInterval(() => this.tick(), 1000);
    }
  }

  skipToNext() {
    if (!this.routine) return;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isResting = false;
    this.currentStepIndex++;
    if (this.currentStepIndex >= this.routine.steps.length) {
      this.complete();
    } else {
      this.startStep();
      if (this.isPlaying) {
        this.interval = setInterval(() => this.tick(), 1000);
      }
    }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private routineService: RoutineService,
    private sessionService: SessionService,
    public authService: AuthService,
  ) {
    // Load voices
    if (this.synth) {
      this.synth.addEventListener('voiceschanged', () => {
        this.voicesLoaded = true;
      });
      // Check if voices already loaded
      if (this.synth.getVoices().length > 0) {
        this.voicesLoaded = true;
      }
    }
  }

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadRoutine(slug);
    }
  }

  ngOnDestroy() {
    this.stop();
    this.removeVisibilityHandler();
  }

  loadRoutine(slug: string) {
    this.routineService.getBySlug(slug).subscribe({
      next: (routine) => {
        this.routine = routine;
        if (routine) {
          this.totalSeconds = this.calculateTotalSeconds(routine);
          this.reset();
        }
      },
      error: (err) => {
        console.error('Error loading routine:', err);
        this.router.navigate(['/routines']);
      },
    });
  }

  calculateTotalSeconds(routine: Routine): number {
    const stepsTotal = routine.steps.reduce(
      (sum, step) => sum + step.seconds,
      0,
    );
    const restsTotal = (routine.steps.length - 1) * this.REST_SECONDS;
    return stepsTotal + restsTotal;
  }

  get currentStep(): Step | null {
    if (!this.routine || this.isResting) return null;
    return this.routine.steps[this.currentStepIndex] || null;
  }

  get currentTitle(): string {
    if (this.isResting) {
      const nextStep = this.routine?.steps[this.currentStepIndex];
      return nextStep ? `Pause – ${nextStep.name}` : 'Pause';
    }
    return this.currentStep?.name || '';
  }

  get currentInstruction(): string {
    if (this.isResting) {
      const nextStep = this.routine?.steps[this.currentStepIndex];
      return nextStep
        ? `Respiration calme. Prépare-toi pour : ${nextStep.name}.`
        : 'Respiration calme.';
    }
    return this.currentStep?.text || '';
  }

  get progressPercent(): number {
    if (!this.routine || !this.startTime || !this.isPlaying) return 0;

    // Calculate elapsed time since start
    const now = new Date();
    const elapsedMs = now.getTime() - this.startTime.getTime();
    const elapsedSeconds = Math.floor(elapsedMs / 1000);

    // Clamp between 0 and 100
    return Math.max(
      0,
      Math.min(100, (elapsedSeconds / this.totalSeconds) * 100),
    );
  }

  remainingGlobalTime(): number {
    if (!this.routine) return 0;
    let remaining = this.timeLeft;

    const startIndex = this.currentStepIndex + (this.isResting ? 0 : 1);
    for (let i = startIndex; i < this.routine.steps.length; i++) {
      remaining += this.routine.steps[i].seconds;
      if (i < this.routine.steps.length - 1) {
        remaining += this.REST_SECONDS;
      }
    }
    return remaining;
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  start() {
    if (!this.routine) return;

    this.isPlaying = true;

    // Record start time on first start
    if (!this.startTime) {
      this.startTime = new Date();
    }

    // Initialize audio context on user interaction
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    if (this.currentStepIndex === 0 && this.timeLeft === 0) {
      this.startStep();
    }

    this.interval = setInterval(() => {
      this.tick();
    }, 1000);

    this.acquireWakeLock();
  }

  pause() {
    this.isPlaying = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
    this.releaseWakeLock();
  }

  stop() {
    this.pause();
    this.reset();
  }

  reset() {
    this.currentStepIndex = 0;
    this.isResting = false;
    this.timeLeft = 0;
    this.isPlaying = false;
    this.startTime = null;
  }

  private tick() {
    if (!this.routine) return;

    this.timeLeft--;

    // Process voice cues based on elapsed time
    if (!this.isResting && this.currentStep) {
      const elapsed = this.currentStep.seconds - this.timeLeft;
      this.processCues(this.currentStep, elapsed);
    }

    if (this.timeLeft <= 0) {
      this.nextStep();
    }
  }

  private startStep() {
    if (!this.routine) return;

    const step = this.routine.steps[this.currentStepIndex];
    if (!step) return;

    this.isResting = false;
    this.timeLeft = step.seconds;
    this.speak(step.name);
  }

  private startRest() {
    if (!this.routine) return;

    const nextStep = this.routine.steps[this.currentStepIndex];
    this.isResting = true;
    this.timeLeft = this.REST_SECONDS;

    if (nextStep) {
      this.speak(
        `Pause de ${this.REST_SECONDS} secondes. Prépare-toi pour le prochain exercice.`,
      );
    }
  }

  private nextStep() {
    if (!this.routine) return;

    if (this.isResting) {
      // End of rest, start actual step
      this.startStep();
    } else {
      // End of step
      this.currentStepIndex++;

      if (this.currentStepIndex >= this.routine.steps.length) {
        // Routine complete
        this.complete();
      } else {
        // Start rest before next step
        this.startRest();
      }
    }
  }

  private complete() {
    this.pause();
    this.speak('Bravo ! Routine terminée.');

    if (!this.routine || !this.startTime) return;

    const endTime = new Date();
    const durationSec = Math.floor(
      (endTime.getTime() - this.startTime.getTime()) / 1000,
    );

    // Save session
    this.sessionService
      .create({
        routineId: this.routine.id,
        startAt: this.startTime,
        endAt: endTime,
        durationSec: durationSec,
        completed: true,
        progress: 1,
      })
      .subscribe({
        next: (session) => {
          this.router.navigate(['/completion'], {
            queryParams: {
              routineName: this.routine?.name,
              duration: durationSec,
              sessionId: session._id,
            },
          });
        },
        error: (err) => {
          console.error('Error saving session:', err);
          this.router.navigate(['/completion'], {
            queryParams: {
              routineName: this.routine?.name,
              duration: durationSec,
            },
          });
        },
      });
  }

  private processCues(step: Step, elapsed: number) {
    if (!step.cues) return;

    for (const cue of step.cues) {
      if (elapsed === cue.at) {
        this.speak(cue.say);
      }
    }
  }

  private getVoiceSettings(): {
    speed: number;
    volume: number;
    bips: boolean;
    voiceName: string;
  } {
    try {
      const raw = localStorage.getItem('voiceSettings');
      if (raw) {
        const v = JSON.parse(raw);
        return {
          speed: v.speed ?? 1.0,
          volume: v.volume ?? 0.7,
          bips: v.bips ?? true,
          voiceName: v.voiceName ?? '',
        };
      }
    } catch {
      /* ignore */
    }
    return { speed: 1.0, volume: 0.7, bips: true, voiceName: '' };
  }

  private speak(text: string) {
    const settings = this.getVoiceSettings();

    if (!this.synth) {
      if (settings.bips) this.beep(880, 0.12);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = settings.speed;
    utterance.pitch = 1.0;
    utterance.volume = settings.volume;

    const voices = this.synth.getVoices();
    const voiceName = settings.voiceName;
    const selectedVoice = voiceName
      ? voices.find((v) => v.name === voiceName)
      : voices.find((v) => v.lang.startsWith('fr'));
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    this.synth.speak(utterance);
  }

  private beep(freq: number, duration: number) {
    if (!this.audioContext) return;

    const settings = this.getVoiceSettings();
    if (!settings.bips) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      const ctx = this.audioContext;
      const peakGain = 0.1 * settings.volume;

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        Math.max(peakGain, 0.001),
        ctx.currentTime + 0.02,
      );

      oscillator.start();

      setTimeout(() => {
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02);
        oscillator.stop();
      }, duration * 1000);
    } catch (e) {
      console.error('Beep error:', e);
    }
  }

  editRoutine() {
    if (!this.routine) return;
    this.router.navigate(['/routines', this.routine.id, 'edit']);
  }

  deleteRoutine() {
    if (!this.routine) return;
    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer la routine "${this.routine.name}" ?`,
      )
    ) {
      this.routineService.delete(this.routine.id).subscribe({
        next: () => {
          this.router.navigate(['/routines']);
        },
        error: (err) => {
          console.error('Error deleting routine:', err);
        },
      });
    }
  }

  goBack() {
    this.router.navigate(['/routines']);
  }

  private async acquireWakeLock(): Promise<void> {
    if (!('wakeLock' in navigator)) return;
    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      this.wakeLock.addEventListener('release', () => {
        this.wakeLock = null;
      });
      this.addVisibilityHandler();
    } catch {
      // Wake Lock request can fail (e.g. low battery, background tab)
    }
  }

  private async releaseWakeLock(): Promise<void> {
    this.removeVisibilityHandler();
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
    }
  }

  private addVisibilityHandler(): void {
    if (this.visibilityHandler) return;
    this.visibilityHandler = () => {
      if (document.visibilityState === 'visible' && this.isPlaying) {
        this.acquireWakeLock();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  private removeVisibilityHandler(): void {
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }
}
