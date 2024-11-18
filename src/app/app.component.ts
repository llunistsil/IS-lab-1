import { TuiButton, TuiIcon, TuiLink, TuiRoot, TuiTitle } from '@taiga-ui/core';
import { Component, DestroyRef, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TuiHeader, TuiNavigation } from '@taiga-ui/layout';
import { TuiAvatar, TuiFade } from '@taiga-ui/kit';
import { AuthService } from './auth/auth.service';
import { KnownRoutePath } from './known-route-path';
import { tuiTakeUntilDestroyed } from '@taiga-ui/cdk';
import { AccountType } from './auth/models/user';

@Component({
  standalone: true,
  imports: [RouterModule, TuiRoot, TuiIcon, TuiNavigation, TuiButton, TuiFade, TuiAvatar, TuiHeader, TuiTitle, TuiLink],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent {
  protected authService = inject(AuthService);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly router = inject(Router);
  protected readonly KnownRoutePath = KnownRoutePath;

  logout(): void {
    this.authService
      .logout()
      .pipe(
        tuiTakeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  };

  protected readonly AccountType = AccountType;
}
