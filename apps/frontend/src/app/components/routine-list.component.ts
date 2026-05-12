import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Routine } from '@flexicoach/shared';
import { RoutineService } from '../services/routine.service';
import { AuthService } from '../services/auth.service';
import { StatsComponent } from './stats.component';

type FilterKey = 'Tout' | 'Quotidien' | 'Bureau' | 'Sport' | 'Mes routines';

@Component({
  selector: 'app-routine-list',
  standalone: true,
  imports: [CommonModule, RouterLink, StatsComponent],
  templateUrl: './routine-list.component.html',
  styleUrls: ['./routine-list.component.scss'],
})
export class RoutineListComponent implements OnInit {
  routines: Routine[] = [];
  loading = false;
  error = '';

  readonly filters: FilterKey[] = ['Tout', 'Quotidien', 'Bureau', 'Sport', 'Mes routines'];
  activeFilter = signal<FilterKey>('Tout');

  get userRoutinesCount(): number {
    return this.routines.filter(r => r.visibility === 'user').length;
  }

  private readonly FILTER_TAGS: Record<string, string[]> = {
    'Quotidien': ['quotidien'],
    'Bureau':    ['bureau'],
    'Sport':     ['sport'],
  };

  // Fallback keyword matching for routines without a tag
  private readonly FILTER_KEYWORDS: Record<string, string[]> = {
    'Quotidien': ['quotidien', 'matin', 'soir', 'douce', 'réveil', 'lever', 'détente', 'relaxation'],
    'Bureau':    ['bureau', 'cervical', 'assis', 'ordinateur', 'poste', 'travail', 'express', 'siège'],
    'Sport':     ['sport', 'squash', 'golf', 'running', 'mobilité', 'hanches', 'ischio', 'mollet', 'épaule', 'rotation', 'post-'],
  };

  filteredRoutines = computed(() => {
    const f = this.activeFilter();
    if (f === 'Mes routines') return this.routines.filter(r => r.visibility === 'user');
    const tags = this.FILTER_TAGS[f];
    if (!tags) return this.routines;
    const keywords = this.FILTER_KEYWORDS[f] ?? [];
    const text = (r: Routine) => `${r.name} ${r.description ?? ''}`.toLowerCase();
    return this.routines.filter(r =>
      r.tag ? tags.includes(r.tag) : keywords.some(kw => text(r).includes(kw))
    );
  });

  constructor(
    private routineService: RoutineService,
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.loadRoutines();
  }

  loadRoutines() {
    this.loading = true;
    this.error = '';

    this.routineService.getAll().subscribe({
      next: (routines) => {
        this.routines = routines;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des routines';
        this.loading = false;
        console.error('Error loading routines:', err);
      },
    });
  }

  selectRoutine(routine: Routine) {
    this.router.navigate(['/routine', routine.slug]);
  }

  setFilter(f: FilterKey) {
    this.activeFilter.set(f);
  }

  getRoutineColor(routine: Routine): string {
    if (routine.visibility === 'user') return 'var(--primary-500)';
    switch (routine.level) {
      case 'Débutant':      return '#22c55e';
      case 'Intermédiaire': return 'var(--primary-500)';
      case 'Avancé':        return '#a855f7';
      default:              return 'var(--primary-400)';
    }
  }

  getBadgeClass(level: string): string {
    switch (level) {
      case 'Débutant':      return 'badge-debutant';
      case 'Intermédiaire': return 'badge-intermediaire';
      case 'Avancé':        return 'badge-avance';
      default:              return 'badge-intermediaire';
    }
  }
}
