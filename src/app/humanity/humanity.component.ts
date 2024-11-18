import { Component, DestroyRef, effect, inject, INJECTOR, input, signal } from '@angular/core';
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
import { ActionWithHumans, Human, WeaponType } from './models/human';
import { HumanityService } from './humanity.service';
import { TuiAutoFocus, TuiLet, tuiTakeUntilDestroyed } from '@taiga-ui/cdk';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { HumanFormComponent, HumanFormDialogContext } from './human-form/human-form.component';
import { merge, Subject, switchMap, timer } from 'rxjs';
import { TuiInputModule, TuiSelectModule } from '@taiga-ui/legacy';

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

  readonly inputData = input<Human[] | null>(null);

  readonly specialActions = ['Set Sorrow', 'MinutesOfWaiting Filter', 'Sum impactSpeed', 'Delete without toothpick', 'Delete by Weapon'];

  readonly filterableColumns = [
    'id',
    'name',
    'impact_speed',
    'soundtrack_name',
    'minutes_of_waiting'
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
  readonly isLoading = signal(false);
  readonly page = signal(0);
  readonly totalItems = signal(0);
  readonly data = signal<Human[]>([]);
  readonly pageSize = 5;
  readonly humanColumns = [
    'id',
    'name',
    'real_hero',
    'has_toothpick',
    'mood',
    'impact_speed',
    'soundtrack_name',
    'minutes_of_waiting',
    'weapon_type'
  ] as const;
  readonly columns = [...this.humanColumns, 'actions'] as const;
  readonly columnNames = {
    id: 'ID',
    name: 'Name',
    real_hero: 'Real Hero',
    has_toothpick: 'Has Toothpick',
    mood: 'Mood',
    impact_speed: 'Impact Speed',
    soundtrack_name: 'Sound Track Name',
    minutes_of_waiting: 'Minutes Of Waiting',
    weapon_type: 'Weapon Type',
    actions: 'Actions'
  };
  readonly actionWithHumans = ActionWithHumans;

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

        const getHumanListSubscription = merge(
          timer(0, 5000),
          this.reset
        )
          .pipe(
            switchMap(() =>
              this.humanityService.getHumanList$({
                page: this.page(),
                size: this.pageSize
              })
            ),
            tuiTakeUntilDestroyed(this.destroyRef)
          )
          .subscribe((response) => {
            this.data.set(response.content);
            console.log(this.data());
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
      .subscribe(() => this.reset.next(null));
  }

  remove(item: Human): void {
    this.humanityService.removeHuman$(item).subscribe(() => this.reset.next(null));
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
      .subscribe(() => this.reset.next(null));
  }

  onMenuClick(item: string): void {
    switch (item) {
      case 'Set Sorrow':
        this.humanityService.setSorrow$().subscribe();
        break;
      case 'Delete without toothpick':
        this.humanityService.deleteWithoutToothpick$().subscribe();
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
        )
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

  protected readonly WeaponType = WeaponType;
}
