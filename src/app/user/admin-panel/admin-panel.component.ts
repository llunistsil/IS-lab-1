import { Component, DestroyRef, inject } from '@angular/core';
import { TuiAlertService, TuiButton } from '@taiga-ui/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, switchMap } from 'rxjs';
import { RequestForApproval } from '../models/request-for-approval';
import { tuiTakeUntilDestroyed } from '@taiga-ui/cdk';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

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
  protected readonly alertService = inject(TuiAlertService);
  protected readonly router = inject(Router);

  private readonly refreshAdminRequestsForApproval$ = new BehaviorSubject(null);

  adminRequestsForApproval = toSignal(
    this.refreshAdminRequestsForApproval$.pipe(
      switchMap(() => this.authService.getAdminRequestsForApproval$()),
      catchError(() => {
        return this.alertService
          .open('Update error: Access Denied', { appearance: 'error' })
          .pipe(takeUntilDestroyed(this.destroyRef));
      }),
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
