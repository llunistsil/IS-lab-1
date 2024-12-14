import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiFileLike, TuiFiles } from '@taiga-ui/kit';
import { catchError, concatMap, finalize, map, Observable, of, Subject, switchMap, timer } from 'rxjs';
import { AsyncPipe, NgIf } from '@angular/common';
import { TuiAlertService, TuiButton, TuiIcon } from '@taiga-ui/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-export-file-form',
  standalone: true,
  imports: [
    TuiFiles,
    ReactiveFormsModule,
    AsyncPipe,
    NgIf,
    TuiButton,
    TuiIcon
  ],
  templateUrl: './export-file-form.component.html',
  styleUrl: './export-file-form.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportFileFormComponent {
  public readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly alertService = inject(TuiAlertService);

  protected readonly control = new FormControl<TuiFileLike | null>(
    null,
    Validators.required
  );

  protected readonly failedFiles$ = new Subject<TuiFileLike | null>();
  protected readonly loadingFiles$ = new Subject<TuiFileLike | null>();
  protected readonly loadedFiles$ = this.control.valueChanges.pipe(
    switchMap((file) => this.processFile(file))
  );

  protected removeFile(): void {
    this.control.setValue(null);
  }

  protected processFile(file: TuiFileLike | null): Observable<TuiFileLike | null> {
    this.failedFiles$.next(null);

    if (this.control.invalid || !file) {
      return of(null);
    }

    this.loadingFiles$.next(file);

    return timer(1000).pipe(
      map(() => {
        return file;
      }),
      finalize(() => this.loadingFiles$.next(null))
    );
  }

  exportFile(file: TuiFileLike): void {
    const formData: FormData = new FormData();
    formData.append('fileHumans', file as File, file.name);

    this.http.post(
      `${ environment.apiUrl }/file/import`,
      formData,
      {
        headers: this.authService.getAuthHeaders()
      }
    )
      .pipe(
        catchError(() => {
          return this.alertService
            .open(`Export error: Invalid Data`, { appearance: 'error' })
            .pipe(takeUntilDestroyed(this.destroyRef));
        }),
        concatMap(() => {
          return this.alertService
            .open('Export success', { appearance: 'positive' })
            .pipe(takeUntilDestroyed(this.destroyRef));
        }),
      )
      .subscribe();
  }
}
