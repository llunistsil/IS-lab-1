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
  TuiSurface,
  TuiTextfield,
  TuiLabel,
  TuiButton,
  TuiLink,
  TuiIcon,
  TuiAlertService, TuiTitle
} from '@taiga-ui/core';
import { TuiCheckbox, TuiPassword } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { AuthService } from '../../auth/auth.service';
import { KnownRoutePath } from '../../known-route-path';

@Component({
  selector: 'app-login',
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
    TuiTitle
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  protected readonly alertService = inject(TuiAlertService);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly KnownRoutePath = KnownRoutePath;
  protected readonly router = inject(Router);

  readonly loginForm = new FormGroup({
    username: new FormControl<string>('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    password: new FormControl<string>('', {
      validators: [Validators.required, Validators.minLength(8)],
      nonNullable: true,
    }),
  });

  ngOnInit(): void {
    if(this.authService.currentUser) {
      this.router.navigate(['']);
    }
  }

  login() {
    if (!this.loginForm.valid) {
      this.alertService
        .open('Form is invalid!')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();

      return;
    }

    this.authService
      .login({
        username: this.loginForm.get('username')!.value,
        password: this.loginForm.get('password')!.value,
      })
      .subscribe({
        complete: () => this.authService.redirectAfterAuth(),
        error: (err: Error) => {
          this.alertService
            .open(err.message, { appearance: 'error' })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe();
        },
      });
  }
}
