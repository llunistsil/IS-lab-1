import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { TuiAppearance, TuiButton, TuiLink } from '@taiga-ui/core';
import { TuiCardLarge } from '@taiga-ui/layout';
import { KnownRoutePath } from '../known-route-path';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, TuiAppearance, TuiCardLarge, TuiLink, RouterLink, NgOptimizedImage, TuiButton],
  templateUrl: './user.component.html',
  styleUrl: './user.component.less',
})
export class UserComponent implements OnInit {
  protected readonly KnownRoutePath = KnownRoutePath;
  protected readonly router = inject(Router);
  protected readonly authService = inject(AuthService);

  ngOnInit(): void {
    if (this.authService.currentUser !== null) {
      this.router.navigate(['/']);
    }
  }
}
