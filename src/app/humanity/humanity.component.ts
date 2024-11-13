import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KnownRoutePath } from '../known-route-path';
import { TuiLink } from '@taiga-ui/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-humanity',
  standalone: true,
  imports: [CommonModule, TuiLink, RouterLink],
  templateUrl: './humanity.component.html',
})
export class HumanityComponent {
  protected readonly KnownRoutePath = KnownRoutePath;
}
