import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SwUpdateService } from './services/sw-update.service';
import { AuthService } from './services/auth.service';
import { ReminderNotificationService } from './services/reminder-notification.service';
import { UpdateNotificationComponent } from './components/update-notification.component';
import { HeaderComponent } from './components/header.component';
import { BottomNavComponent } from './components/bottom-nav.component';

@Component({
  imports: [
    RouterModule,
    CommonModule,
    UpdateNotificationComponent,
    HeaderComponent,
    BottomNavComponent,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.sass'],
})
export class AppComponent implements OnInit {
  constructor(
    private swUpdateService: SwUpdateService,
    private authService: AuthService,
    private reminderNotifications: ReminderNotificationService,
  ) {}

  ngOnInit(): void {
    this.swUpdateService.checkForUpdates();

    // Check admin status after DI is fully resolved (avoids circular dependency)
    if (this.authService.getToken()) {
      this.authService.checkAdminStatus();
    }

    // Start reminder notifications if already granted
    if (this.reminderNotifications.permission() === 'granted') {
      this.reminderNotifications.start();
    }
  }
}
