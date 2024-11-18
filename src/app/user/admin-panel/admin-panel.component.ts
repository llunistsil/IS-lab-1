import { Component, DestroyRef, inject } from '@angular/core';
import { TuiButton } from '@taiga-ui/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, switchMap } from 'rxjs';
import { RequestForApproval } from '../models/request-for-approval';
import { tuiTakeUntilDestroyed } from '@taiga-ui/cdk';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    TuiButton
  ],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.less'
})
export class AdminPanelComponent {
  protected readonly authService = inject(AuthService);
  protected readonly destroyRef = inject(DestroyRef);

  private readonly refreshAdminRequestsForApproval$ = new BehaviorSubject(null);

  adminRequestsForApproval = toSignal(
    this.refreshAdminRequestsForApproval$.pipe(
      switchMap(() => this.authService.getAdminRequestsForApproval$()),
      takeUntilDestroyed(this.destroyRef)
    )
  );

  approve(request: RequestForApproval): void {
    this.authService
      .approveAdminRequest$(request)
      .pipe(tuiTakeUntilDestroyed(this.destroyRef))
      .subscribe({
        complete: () => this.refreshAdminRequestsForApproval$.next(null),
      });
  }

}
