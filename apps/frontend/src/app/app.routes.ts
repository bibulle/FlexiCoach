import { Route } from '@angular/router';
import { RoutineListComponent } from './components/routine-list.component';
import { RoutinePlayerComponent } from './components/routine-player.component';

export const appRoutes: Route[] = [
  { path: '', component: RoutineListComponent },
  { path: 'routine/:slug', component: RoutinePlayerComponent },
];
