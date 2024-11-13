import { Route } from '@angular/router';
import { KnownRoutePath } from '../known-route-path';
import { UserComponent } from './user.component';

export const routes: Route[] = [
  {
    path: KnownRoutePath.Login,
    loadChildren: () =>
      import('./login/login.routes').then(
        module => module.routes
      ),
  },
  {
    path: KnownRoutePath.Register,
    loadChildren: () =>
      import('./register/register.routes').then(
        module => module.routes
      ),
  },
  {
    path: '',
    component: UserComponent,
  },
];