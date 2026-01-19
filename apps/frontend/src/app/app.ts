import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SwUpdateService } from './services/sw-update.service';
import { AuthService } from './services/auth.service';
import { UpdateNotificationComponent } from './components/update-notification.component';
import { HeaderComponent } from './components/header.component';

@Component({
  imports: [RouterModule, CommonModule, UpdateNotificationComponent, HeaderComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.sass'],
})
export class AppComponent implements OnInit {
  constructor(
    private swUpdateService: SwUpdateService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.swUpdateService.checkForUpdates();

    // Check admin status after DI is fully resolved (avoids circular dependency)
    if (this.authService.getToken()) {
      this.authService.checkAdminStatus();
    }
  }
}
