import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { AccountType } from './models/user';
import { KnownRoutePath } from '../known-route-path';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (environment.mockAuthForTesting) {
    authService.currentUser = {
      username: 'admin',
      token: '12345',
      accountType: AccountType.User,
    };
    console.log(authService.currentUser);

    return true;
  } else if (authService.isAuthenticated) {
    return true;
  } else {
    return authService
      .authViaToken()
      .pipe(map((isSuccess) => (isSuccess ? true : router.parseUrl(`${KnownRoutePath.User}/${KnownRoutePath.Login}`))));
  }
};
