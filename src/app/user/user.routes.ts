import { Route } from '@angular/router';
import { KnownRoutePath } from '../known-route-path';
import { UserComponent } from './user.component';
import { adminGuard } from '../auth/admin.guard';

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
    path: KnownRoutePath.AdminPanel,
    loadChildren: () =>
      import('./admin-panel/admin-panel.routes').then(
        module => module.routes
      ),
    canActivate: [adminGuard],
  },
  {
    path: '',
    component: UserComponent,
  },
];