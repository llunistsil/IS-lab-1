import { Component, DestroyRef, effect, inject, INJECTOR } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TuiAlertService,
  TuiButton,
  TuiDataList, TuiDialog,
  TuiDialogService, TuiDropdown,
  TuiLink,
  TuiLoader,
  TuiTextfield
} from '@taiga-ui/core';
import { RouterLink } from '@angular/router';
import { TuiAccordion, TuiDataListWrapper, TuiStatus } from '@taiga-ui/kit';
import { TuiTable, TuiTableFilters, TuiTablePagination } from '@taiga-ui/addon-table';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActionWithHumans, Human, toHuman, WeaponType } from './models/human';
import { HumanityService } from './humanity.service';
import { TuiAutoFocus, TuiLet, tuiTakeUntilDestroyed } from '@taiga-ui/cdk';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { HumanFormComponent, HumanFormDialogContext } from './human-form/human-form.component';
import { BehaviorSubject, merge, Subject, switchMap, take, tap } from 'rxjs';
import { TuiInputModule, TuiSelectModule } from '@taiga-ui/legacy';
import { HumanityWebSocketService } from './humanity-web-socket.service';
import { WSData, WSOperationType } from './models/web-socket';
import { ExportFileFormComponent } from './export-file-form/export-file-form.component';
import { ImportFileFormComponent } from './import-file-form/import-file-form.component';

@Component({
  selector: 'app-humanity',
  standalone: true,
  imports: [CommonModule, TuiLink, RouterLink, TuiAccordion, TuiTableFilters, ReactiveFormsModule, TuiLoader, TuiTable, TuiTextfield, TuiTablePagination, TuiStatus, TuiButton, TuiLet, TuiDataList, TuiDropdown, TuiDataListWrapper, TuiDialog, TuiInputModule, TuiAutoFocus, TuiSelectModule],
  templateUrl: './humanity.component.html',
  styleUrls: ['./humanity.component.less']
})
export class HumanityComponent {
  protected readonly humanityService = inject(HumanityService);
  private readonly dialogService = inject(TuiDialogService);
  private readonly injector = inject(INJECTOR);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly alertService = inject(TuiAlertService);
  protected readonly humanityWebSocketService = inject(HumanityWebSocketService);
  private readonly reset = new Subject();
  protected open = false;
  protected openWeapon = false;
  protected openMinutesOfWaiting = false;
  protected minutesOfWaitingFrom = new FormGroup({
    minutesOfWaiting: new FormControl('')
  });
  protected weaponForm = new FormGroup({
    weaponType: new FormControl('')
  });

  readonly specialActions = ['Set Sorrow', 'MinutesOfWaiting Filter', 'Sum impactSpeed', 'Delete without toothpick', 'Delete by Weapon'];

  readonly filterableColumns = [
    'id',
    'name',
    'impactSpeed',
    'soundtrackName',
    'minutesOfWaiting'
  ] as const;
  readonly filtersForm = new FormGroup<
    Partial<Record<keyof Human, FormControl>>
  >(
    this.filterableColumns.reduce(
      (prev, curr) => ({
        ...prev,
        [curr]: new FormControl('')
      }),
      {}
    )
  );
  readonly filterFn = (item: object, value: object | null): boolean =>
    !value || item.toString().includes(value.toString());
  readonly humanColumns = [
    'id',
    'name',
    'realHero',
    'hasToothpick',
    'mood',
    'impactSpeed',
    'soundtrackName',
    'minutesOfWaiting',
    'weaponType'
  ] as const;
  readonly isLoading$ = new BehaviorSubject(false);
  readonly page$ = new BehaviorSubject(0);
  readonly sort$ = new BehaviorSubject(this.humanColumns[0])
  readonly totalItems$ = new BehaviorSubject(0);
  readonly data$ = new BehaviorSubject<Human[]>([]);
  readonly pageSize$ = new BehaviorSubject(5);
  readonly columns = [...this.humanColumns, 'actions'] as const;
  readonly columnNames = {
    id: 'ID',
    name: 'Name',
    realHero: 'Real Hero',
    hasToothpick: 'Has Toothpick',
    mood: 'Mood',
    impactSpeed: 'Impact Speed',
    soundtrackName: 'Sound Track Name',
    minutesOfWaiting: 'Minutes Of Waiting',
    weaponType: 'Weapon Type',
    actions: 'Actions'
  };
  readonly actionWithHumans = ActionWithHumans;

  constructor() {
    effect(
      (onCleanup) => {

        this.isLoading$.next(true);

        const getHumanListSubscription = merge(
          this.page$,
          this.pageSize$,
          this.reset
        ).pipe(
          tap(console.log),
          tuiTakeUntilDestroyed(this.destroyRef),
          switchMap(() =>
            this.humanityService.getHumanList$({
              page: this.page$.value,
              size: this.pageSize$.value,
              sort: [ this.sort$.value ]
            })
          )
        ).subscribe((response) => {
          this.data$.next(response.content.map((human) => {
            return toHuman(human);
          }));
          this.totalItems$.next(response.totalElements);
          this.isLoading$.next(false);
        });

        onCleanup(() => {
          getHumanListSubscription.unsubscribe();
        });
      },
      { allowSignalWrites: true }
    );
    this.humanityWebSocketService.onMessage()
      .subscribe((messages: WSData) => {
        if (
          messages.operationType === WSOperationType.CREATE_HUMAN ||
          messages.operationType === WSOperationType.UPDATE_HUMAN ||
          messages.operationType === WSOperationType.ATTACH_CAR ||
          messages.operationType === WSOperationType.UPDATE_CAR
        ) {
          this.reset.next(true);
        }
      });
  }

  edit(item: any): void {
    this.dialogService
      .open<{ item: any; mode: ActionWithHumans }>(
        new PolymorpheusComponent(HumanFormComponent, this.injector),
        {
          data: {
            item,
            mode: ActionWithHumans.Update
          } as HumanFormDialogContext,
          dismissible: true,
          label: 'Edit Human'
        }
      )
      .pipe(tuiTakeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  remove(item: Human): void {
    this.humanityService.removeHuman$(item).subscribe();
  }

  view(item: Human): void {
    this.dialogService
      .open<{ item: Human; mode: ActionWithHumans }>(
        new PolymorpheusComponent(HumanFormComponent, this.injector),
        {
          data: {
            item,
            mode: ActionWithHumans.Read
          },
          dismissible: true,
          label: 'View Human'
        }
      )
      .pipe(tuiTakeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  createNewHuman(): void {
    this.dialogService
      .open<{ mode: ActionWithHumans.Create }>(
        new PolymorpheusComponent(HumanFormComponent, this.injector),
        {
          data: {
            mode: ActionWithHumans.Create
          },
          dismissible: true,
          label: 'Create human'
        }
      )
      .pipe(tuiTakeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  openFileExporter(): void {
    this.dialogService
      .open(
        new PolymorpheusComponent(ExportFileFormComponent, this.injector),
        {
          dismissible: true,
          label: 'Export file'
        }
      )
      .pipe(tuiTakeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  openFileImporter(): void {
    this.dialogService
      .open(
        new PolymorpheusComponent(ImportFileFormComponent, this.injector),
        {
          dismissible: true,
          label: 'Import file'
        }
      )
      .pipe(tuiTakeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  onMenuClick(item: string): void {
    switch (item) {
      case 'Set Sorrow':
        this.humanityService.setSorrow$().subscribe(() => this.reset.next(true));
        break;
      case 'Delete without toothpick':
        this.humanityService.deleteWithoutToothpick$().subscribe(() => this.reset.next(true));
        this.open = false;
        break;
      case 'Delete by Weapon':
        this.openWeapon = true;
        break;
      case 'MinutesOfWaiting Filter':
        this.openMinutesOfWaiting = true;
        break;
      case 'Sum impactSpeed':
        this.humanityService.uniqueImpactSpeed$().subscribe(
          res => {
            this.alertService.open(res, { label: 'Unique:' }).subscribe();
          }
        );
    }
  }

  showCountMinutes(): void {
    this.humanityService.countMinutes$(this.minutesOfWaitingFrom.value.minutesOfWaiting)
      .subscribe(
        res => {
          this.alertService.open(res, { label: 'Count:' }).subscribe();
        }
      );
  }

  deleteByWeapon(weapon: any): void {
    this.humanityService.deleteByWeaponType$(weapon).pipe(take(1)).subscribe(() => this.reset.next(true));
  }

  protected readonly WeaponType = WeaponType;
}
