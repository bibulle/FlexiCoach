import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StatsService, StatsSummary } from '../services/stats.service';

@Component({
  selector: 'app-stats',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
})
export class StatsComponent implements OnInit {
  summary: StatsSummary | null = null;
  loading = true;
  error: string | null = null;

  constructor(private statsService: StatsService) {}

  ngOnInit(): void {
    this.loadSummary();
  }

  private loadSummary(): void {
    this.loading = true;
    this.error = null;

    this.statsService.getSummary().subscribe({
      next: (summary) => {
        this.summary = summary;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des stats:', err);
        this.error = 'Impossible de charger les statistiques';
        this.loading = false;
      },
    });
  }

  get formattedMinutes(): string {
    if (!this.summary) return '0';
    const hours = Math.floor(this.summary.totalMinutes / 60);
    const mins = this.summary.totalMinutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
    }
    return `${mins}min`;
  }
}
