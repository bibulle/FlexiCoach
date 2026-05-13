import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

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
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.routineName = params['routineName'] || '';
      this.duration = parseInt(params['duration'] || '0', 10);
    });
  }

  selectFeeling(value: number) {
    this.selectedFeeling = value;
  }

  finish() {
    this.router.navigate(['/']);
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
