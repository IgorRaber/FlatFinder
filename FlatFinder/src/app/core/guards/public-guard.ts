import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const publicGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const user = await authService.getCurrentUserPromise();

  if (user) {
    return router.createUrlTree(['/home']);
  }

  return true;
};