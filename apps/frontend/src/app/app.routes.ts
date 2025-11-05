import { Route } from '@angular/router';
import { RoutineListComponent } from './components/routine-list.component';
import { RoutinePlayerComponent } from './components/routine-player.component';
import { CompletionComponent } from './components/completion.component';

export const appRoutes: Route[] = [
  { path: '', component: RoutineListComponent },
  { path: 'routine/:slug', component: RoutinePlayerComponent },
  { path: 'completion', component: CompletionComponent },
];
