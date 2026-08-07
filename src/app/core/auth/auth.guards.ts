import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';

import { AuthService } from './auth.service';
import { UserType } from './auth.models';

function redirectForUser(router: Router, userType: UserType): UrlTree {
  return router.createUrlTree([userType === 'platform_admin' ? '/admin/dashboard' : '/portal/dashboard']);
}

export const authGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.ensureSession().pipe(
    map((user) => {
      if (!user) {
        return router.createUrlTree(['/login']);
      }
      if (user.must_change_password) {
        return router.createUrlTree(['/change-password']);
      }
      return true;
    }),
  );
};

export function roleGuard(expectedRole: UserType): CanActivateFn {
  return (): Observable<boolean | UrlTree> => {
    const auth = inject(AuthService);
    const router = inject(Router);

    return auth.ensureSession().pipe(
      map((user) => {
        if (!user) {
          return router.createUrlTree(['/login']);
        }
        if (user.must_change_password) {
          return router.createUrlTree(['/change-password']);
        }
        return user.user_type === expectedRole ? true : redirectForUser(router, user.user_type);
      }),
    );
  };
}

export const passwordChangeGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.ensureSession().pipe(
    map((user) => {
      if (!user) {
        return router.createUrlTree(['/login']);
      }
      return user.must_change_password ? true : redirectForUser(router, user.user_type);
    }),
  );
};

export const publicOnlyGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.ensureSession().pipe(
    map((user) => {
      if (!user) {
        return true;
      }
      return user.must_change_password
        ? router.createUrlTree(['/change-password'])
        : redirectForUser(router, user.user_type);
    }),
  );
};
