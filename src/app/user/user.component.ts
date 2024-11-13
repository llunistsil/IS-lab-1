import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { TuiAppearance, TuiButton, TuiLink } from '@taiga-ui/core';
import { TuiCardLarge } from '@taiga-ui/layout';
import { KnownRoutePath } from '../known-route-path';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { tuiTakeUntilDestroyed } from '@taiga-ui/cdk';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, TuiAppearance, TuiCardLarge, TuiLink, RouterLink, NgOptimizedImage, TuiButton],
  templateUrl: './user.component.html',
  styleUrl: './user.component.less',
})
export class UserComponent {
  protected readonly KnownRoutePath = KnownRoutePath;
  protected readonly authService = inject(AuthService);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly router = inject(Router);

  logout(): void {
    this.authService
      .logout()
      .pipe(tuiTakeUntilDestroyed(this.destroyRef))
      .subscribe({ complete: void this.router.navigate([KnownRoutePath.Login]) });
  }
}
