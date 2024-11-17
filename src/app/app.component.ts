import { TuiButton, TuiDialogService, TuiIcon, TuiLink, TuiRoot, TuiTitle } from '@taiga-ui/core';
import { Component, DestroyRef, inject, INJECTOR } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TuiHeader, TuiNavigation } from '@taiga-ui/layout';
import { TuiAvatar, TuiFade } from '@taiga-ui/kit';
import { AuthService } from './auth/auth.service';
import { KnownRoutePath } from './known-route-path';
import { tuiTakeUntilDestroyed } from '@taiga-ui/cdk';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { ActionWithHumans } from './humanity/models/human';
import { HumanFormComponent } from './humanity/human-form/human-form.component';

@Component({
  standalone: true,
  imports: [RouterModule, TuiRoot, TuiIcon, TuiNavigation, TuiButton, TuiFade, TuiAvatar, TuiHeader, TuiTitle, TuiLink],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent {
  protected readonly dialogService = inject(TuiDialogService);
  protected authService = inject(AuthService);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly router = inject(Router);
  protected readonly injector = inject(INJECTOR);
  protected readonly KnownRoutePath = KnownRoutePath;

  logout(): void {
    this.authService
      .logout()
      .pipe(tuiTakeUntilDestroyed(this.destroyRef))
      .subscribe();
  };

  createNewHuman(): void {
    this.dialogService
      .open<{ mode: ActionWithHumans.Create }>(
        new PolymorpheusComponent(HumanFormComponent, this.injector),
        {
          data: {
            mode: ActionWithHumans.Create,
          },
          dismissible: true,
          label: 'Create human',
        }
      )
      .pipe(tuiTakeUntilDestroyed(this.destroyRef))
      .subscribe();
  }


}
