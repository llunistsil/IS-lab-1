import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject, OnInit
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  TuiAlertService, TuiAppearance,
  TuiButton,
  TuiIcon,
  TuiLabel,
  TuiLink,
  TuiSurface,
  TuiTextfield, TuiTitle
} from '@taiga-ui/core';
import { TuiCheckbox, TuiPassword } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { AuthService } from '../../auth/auth.service';
import { KnownRoutePath } from '../../known-route-path';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TuiCardLarge,
    TuiSurface,
    TuiTextfield,
    TuiLabel,
    TuiCheckbox,
    TuiButton,
    TuiLink,
    TuiIcon,
    TuiPassword,
    RouterLink,
    TuiTitle,
    TuiAppearance
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.less',],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnInit {
  private readonly authService = inject(AuthService);
  protected readonly alertService = inject(TuiAlertService);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly KnownRoutePath = KnownRoutePath;
  protected readonly router = inject(Router);

  readonly registrationForm = new FormGroup({
    username: new FormControl<string>('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    password: new FormControl<string>('', {
      validators: [Validators.required, Validators.minLength(8)],
      nonNullable: true,
    }),
    isAdmin: new FormControl<boolean>(false, { nonNullable: true }),
  });


  ngOnInit(): void {
    if(this.authService.currentUser) {
      this.router.navigate(['']);
    }
  }

  public register() {
    if (!this.registrationForm.valid) {
      this.alertService
        .open('Form is invalid!')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();

      return;
    }

    const requestParams = {
      username: this.registrationForm.get('username')!.value,
      password: this.registrationForm.get('password')!.value,
    };
    const hasAdminRequest = this.registrationForm.get('isAdmin')!.value;
    const registerByRole = hasAdminRequest ? this.authService.registerAdmin(requestParams) : this.authService.register(requestParams);

    registerByRole
      .subscribe({
        complete: () => this.authService.redirectAfterAuth(),
        error: (err: HttpErrorResponse) => {
          this.alertService
            .open(err.message, { appearance: 'error' })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe();
        },
      });
  }
}
