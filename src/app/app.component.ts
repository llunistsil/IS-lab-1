import { TuiButton, TuiIcon, TuiRoot } from '@taiga-ui/core';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TuiNavigation } from '@taiga-ui/layout';
import { TuiFade } from '@taiga-ui/kit';

@Component({
  standalone: true,
  imports: [RouterModule, TuiRoot, TuiIcon, TuiNavigation, TuiButton, TuiFade],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent { }
