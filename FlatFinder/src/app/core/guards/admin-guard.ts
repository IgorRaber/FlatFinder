import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { auth } from '../firebase/firebase';
import { UsersService } from '../services/users';

export const adminGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const usersService = inject(UsersService);

  const user = auth.currentUser;

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  const appUser = await usersService.getUserById(user.uid);

  if (!appUser?.isAdmin) {
    return router.createUrlTree(['/home']);
  }

  return true;
};