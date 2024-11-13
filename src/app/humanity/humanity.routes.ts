import { Route } from '@angular/router';
import { HumanityComponent } from './humanity.component';

export const routes: Route[] = [
  {
    path: '',
    component: HumanityComponent,
  },
  {
    path: '**',
    redirectTo: '/',
  },
];