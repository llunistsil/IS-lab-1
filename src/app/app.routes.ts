import { Route } from '@angular/router';
import { KnownRoutePath } from './known-route-path';
import { authGuard } from './auth/auth.guard';

export const appRoutes: Route[] = [
  {
    path: '',
    loadChildren: () =>
      import('./humanity/humanity.routes').then(
        module => module.routes,
      ),
    canActivate: [authGuard],
  },
  {
    path: KnownRoutePath.User,
    loadChildren: () =>
      import('./user/user.routes').then(
        module => module.routes,
      ),
  },
  {
    path: KnownRoutePath.NotFound,
    loadChildren: () =>
      import('./not-found/not-found.routes').then(
        module => module.routes,
      ),
  },
  {
    path: '**',
    redirectTo: KnownRoutePath.NotFound,
  },
];
