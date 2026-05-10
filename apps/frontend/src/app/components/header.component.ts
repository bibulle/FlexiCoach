import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserMenuComponent } from './user-menu.component';
import { APP_VERSION } from '../version';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, UserMenuComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  breadcrumbs = signal<Breadcrumb[]>([]);
  private routerSubscription?: Subscription;
  appVersion = APP_VERSION;

  ngOnInit(): void {
    // Build breadcrumbs on initial load
    this.buildBreadcrumbs();

    // Subscribe to route changes
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.buildBreadcrumbs();
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  private buildBreadcrumbs(): void {
    const url = this.router.url;
    const crumbs: Breadcrumb[] = [];

    // Root path - no breadcrumbs
    if (url === '/' || url === '/home' || url === '/login' || url === '/signup') {
      this.breadcrumbs.set([]);
      return;
    }

    // Always add "Routines" as first breadcrumb for authenticated routes
    crumbs.push({ label: 'Routines', url: '/' });

    // Parse URL and build appropriate breadcrumbs
    if (url.startsWith('/routines/new')) {
      crumbs.push({ label: 'Nouvelle routine', url: '/routines/new' });
    } else if (url.match(/\/routines\/[^/]+\/edit/)) {
      crumbs.push({ label: 'Éditer', url: url });
    } else if (url.startsWith('/routine/')) {
      // Extract routine name from URL if possible, otherwise use generic label
      const routineName = url.split('/')[2];
      crumbs.push({ label: 'Routine', url: url });
    } else if (url.startsWith('/calendar')) {
      crumbs.push({ label: 'Calendrier', url: '/calendar' });
    } else if (url.startsWith('/completion')) {
      crumbs.push({ label: 'Complétion', url: '/completion' });
    } else if (url.startsWith('/admin')) {
      crumbs.push({ label: 'Administration', url: '/admin' });
    }

    this.breadcrumbs.set(crumbs);
  }
}
