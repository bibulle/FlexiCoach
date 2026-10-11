import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  // The admin status comes from the backend: wait for the answer instead of
  // reading the `isAdmin` signal, still false on a direct access or a reload.
  return authService
    .resolveAdminStatus()
    .pipe(map((isAdmin) => (isAdmin ? true : router.createUrlTree(['/']))));
};
