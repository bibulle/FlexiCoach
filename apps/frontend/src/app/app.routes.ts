import { Route } from '@angular/router';
import { HomeComponent } from './components/home.component';
import { RoutineListComponent } from './components/routine-list.component';
import { RoutinePlayerComponent } from './components/routine-player.component';
import { RoutineEditorComponent } from './components/routine-editor.component';
import { CompletionComponent } from './components/completion.component';
import { CalendarComponent } from './components/calendar.component';
import { LoginComponent } from './components/login.component';
import { SignupComponent } from './components/signup.component';
import { AuthCallbackComponent } from './components/auth-callback.component';
import { AdminComponent } from './components/admin.component';
import { StatsComponent } from './components/stats.component';
import { authGuard } from './guards/auth.guard';

export const appRoutes: Route[] = [
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'auth/callback', component: AuthCallbackComponent },
  { path: '', component: RoutineListComponent, canActivate: [authGuard] },
  {
    path: 'routines/new',
    component: RoutineEditorComponent,
    canActivate: [authGuard],
  },
  {
    path: 'routines/:id/edit',
    component: RoutineEditorComponent,
    canActivate: [authGuard],
  },
  {
    path: 'routine/:slug',
    component: RoutinePlayerComponent,
    canActivate: [authGuard],
  },
  {
    path: 'completion',
    component: CompletionComponent,
    canActivate: [authGuard],
  },
  { path: 'calendar', component: CalendarComponent, canActivate: [authGuard] },
  { path: 'settings', component: StatsComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
];
