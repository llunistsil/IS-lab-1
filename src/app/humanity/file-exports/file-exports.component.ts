import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, switchMap, timer } from 'rxjs';
import { PaginatedRequest, PaginatedResponse } from '../models/params';
import { TuiLet, tuiTakeUntilDestroyed } from '@taiga-ui/cdk';
import { TuiLoader } from '@taiga-ui/core';
import { AsyncPipe, NgForOf } from '@angular/common';
import {
  TuiTableCell,
  TuiTableDirective,
  TuiTableFiltersPipe,
  TuiTableHead,
  TuiTableSortPipe, TuiTableTbody, TuiTableTd, TuiTableTh, TuiTableThGroup, TuiTableTr
} from '@taiga-ui/addon-table';

export interface FileExport {
  id: number;
  user: {
    id: number;
    username: string;
  };
  objects_added: number | null;
  success: boolean;
  started_time: Date;
  finish_time: Date;
}

@Component({
  selector: 'app-file-exports',
  standalone: true,
  imports: [
    TuiLoader,
    AsyncPipe,
    NgForOf,
    TuiLet,
    TuiTableCell,
    TuiTableDirective,
    TuiTableFiltersPipe,
    TuiTableHead,
    TuiTableSortPipe,
    TuiTableTbody,
    TuiTableTd,
    TuiTableTh,
    TuiTableThGroup,
    TuiTableTr
  ],
  templateUrl: './file-exports.component.html',
  styleUrl: './file-exports.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileExportsComponent {
  public readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  readonly columns = [
    'id',
    'user',
    'objects_added',
    'success',
    'started_time',
    'finish_time',
  ] as const;

  readonly columnNames = {
    id: 'ID',
    user: 'User',
    objects_added: 'Objects added',
    success: 'Success',
    started_time: 'Start time',
    finish_time: 'Finish time',
  };

  readonly inputData = input<FileExport[] | null>(null);

  readonly isLoading = signal(false);
  readonly page = signal(0);
  readonly totalItems = signal(0);
  readonly data = signal<FileExport[]>([]);
  readonly pageSize = 5;

  constructor() {
    effect(
      (onCleanup) => {
        const inputData = this.inputData();
        if (inputData) {
          this.data.set(inputData);
          this.totalItems.set(inputData.length);
          return;
        }

        this.isLoading.set(true);

        const getHumanListSubscription =
          timer(0,5000)
            .pipe(
              switchMap(() =>
                this.getExports({
                  page: this.page(),
                  size: this.pageSize,
                })
              ),
              tuiTakeUntilDestroyed(this.destroyRef)
            )
            .subscribe((response) => {
              this.data.set(response.content);
              console.log(this.data())
              this.totalItems.set(response.totalElements);
              this.isLoading.set(false);
            });

        onCleanup(() => {
          getHumanListSubscription.unsubscribe();
        });
      },
      { allowSignalWrites: true }
    );
  }

  getExports(params: PaginatedRequest): Observable<PaginatedResponse<FileExport>> {
    return this.http.get<any>(`${ environment.apiUrl }/file/import`,{
      headers: this.authService.getAuthHeaders(),
      params: params
    })
  }

  protected readonly Date = Date;
}
