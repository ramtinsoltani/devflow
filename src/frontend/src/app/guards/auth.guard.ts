import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@devflow/services';

export const authGuard: CanActivateFn = async (route, state) => {
  
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.waitForAuthReady();

  if ( ! auth.currentUser )
    router.navigate(['/login']);

  return !! auth.currentUser;
  
};
