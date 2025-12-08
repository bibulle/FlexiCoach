import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SwUpdateService } from '../services/sw-update.service';
import { Subscription } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-update-notification',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="update-notification" [@slideIn]="show ? 'visible' : 'hidden'" *ngIf="show">
      <div class="update-content">
        <mat-icon>system_update</mat-icon>
        <span class="update-message">Nouvelle version disponible</span>
      </div>
      <button mat-flat-button color="primary" (click)="update()">
        Mettre à jour
      </button>
    </div>
  `,
  styleUrls: ['./update-notification.component.css'],
  animations: [
    trigger('slideIn', [
      state('hidden', style({
        transform: 'translateX(120%)',
        opacity: 0
      })),
      state('visible', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      transition('hidden => visible', animate('400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)')),
      transition('visible => hidden', animate('300ms ease-in'))
    ])
  ]
})
export class UpdateNotificationComponent implements OnInit, OnDestroy {
  show = false;
  private subscription?: Subscription;

  constructor(
    private swUpdateService: SwUpdateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscription = this.swUpdateService.updateAvailable$.subscribe(
      (available) => {
        this.show = available;
        this.cdr.detectChanges();
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  update(): void {
    this.swUpdateService.applyUpdate();
  }
}
