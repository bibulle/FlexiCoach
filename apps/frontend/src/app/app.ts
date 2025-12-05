import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { SwUpdateService } from './services/sw-update.service';
import { UpdateNotificationComponent } from './components/update-notification.component';

@Component({
  imports: [RouterModule, CommonModule, UpdateNotificationComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.sass'],
})
export class AppComponent implements OnInit {
  protected title = 'FlexiCoach';

  constructor(
    public authService: AuthService,
    private router: Router,
    private swUpdateService: SwUpdateService
  ) {}

  ngOnInit(): void {
    this.swUpdateService.checkForUpdates();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
