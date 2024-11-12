import { Route } from '@angular/router';
import { KnownRoutePath } from './known-route-path';

export const appRoutes: Route[] = [
  {
    path: '',
    loadChildren: () =>
      import('./humanity/humanity.routes').then(
        module => module.routes,
      ),
  },
  {
    path: KnownRoutePath.Authentication,
    loadChildren: () =>
      import('./authentication/authentication.routes').then(
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
