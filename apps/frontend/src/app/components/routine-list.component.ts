import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Routine } from '@flexicoach/shared';
import { RoutineService } from '../services/routine.service';
import { StatsComponent } from './stats.component';

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

  constructor(private routineService: RoutineService, private router: Router) {}

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

  editRoutine(routine: Routine) {
    this.router.navigate(['/routines', routine.id, 'edit']);
  }

  deleteRoutine(routine: Routine) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la routine "${routine.name}" ?`)) {
      this.routineService.delete(routine.id).subscribe({
        next: () => {
          this.loadRoutines();
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression de la routine';
          console.error('Error deleting routine:', err);
        },
      });
    }
  }
}
