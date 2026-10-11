import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./bottom-nav.component.scss'],
})
export class BottomNavComponent {
  authService = inject(AuthService);
}
