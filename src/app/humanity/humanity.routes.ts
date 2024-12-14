import { Route } from '@angular/router';
import { HumanityComponent } from './humanity.component';
import { KnownRoutePath } from '../known-route-path';
import { FileExportsComponent } from './file-exports/file-exports.component';

export const routes: Route[] = [
  {
    path: '',
    component: HumanityComponent,
  },
  {
    path: KnownRoutePath.FileExport,
    component: FileExportsComponent,
  }
];