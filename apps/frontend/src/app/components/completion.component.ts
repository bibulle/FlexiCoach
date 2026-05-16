import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-completion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './completion.component.html',
  styleUrls: ['./completion.component.scss'],
})
export class CompletionComponent implements OnInit {
  routineName = '';
  duration = 0;
  sessionId = '';
  selectedFeeling: number | null = null;
  note = '';

  feelings = [
    { value: 1, emoji: '😫', label: 'Difficile' },
    { value: 2, emoji: '😕', label: 'Dur' },
    { value: 3, emoji: '😐', label: 'Correct' },
    { value: 4, emoji: '🙂', label: 'Bien' },
    { value: 5, emoji: '😊', label: 'Excellent' },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sessionService: SessionService,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.routineName = params['routineName'] || '';
      this.duration = parseInt(params['duration'] || '0', 10);
      this.sessionId = params['sessionId'] || '';
    });
  }

  selectFeeling(value: number) {
    this.selectedFeeling = value;
  }

  finish() {
    if (this.sessionId && this.selectedFeeling !== null) {
      this.sessionService
        .update(this.sessionId, { feeling: this.selectedFeeling })
        .subscribe({
          next: () => this.router.navigate(['/']),
          error: () => this.router.navigate(['/']),
        });
    } else {
      this.router.navigate(['/']);
    }
  }

  navigateToCalendar() {
    this.router.navigate(['/calendar']);
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}
