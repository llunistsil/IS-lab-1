import { Component, DestroyRef, effect, inject, INJECTOR, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KnownRoutePath } from '../known-route-path';
import { TuiButton, TuiDialogService, TuiLink, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { RouterLink } from '@angular/router';
import { TuiAccordion, TuiStatus } from '@taiga-ui/kit';
import { TuiTable, TuiTableFilters, TuiTablePagination } from '@taiga-ui/addon-table';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActionWithHumans, Coordinates, Human, Mood, WeaponType } from './models/human';
import { Car } from './models/car';
import { HumanityService } from './humanity.service';
import { AuthService } from '../auth/auth.service';
import { tuiTakeUntilDestroyed } from '@taiga-ui/cdk';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { HumanFormComponent, HumanFormDialogContext } from './human-form/human-form.component';
import { interval, merge, switchMap } from 'rxjs';

@Component({
  selector: 'app-humanity',
  standalone: true,
  imports: [CommonModule, TuiLink, RouterLink, TuiAccordion, TuiTableFilters, ReactiveFormsModule, TuiLoader, TuiTable, TuiTextfield, TuiTablePagination, TuiStatus, TuiButton],
  templateUrl: './humanity.component.html',
})
export class HumanityComponent {
  private readonly humanityService = inject(HumanityService);
  private readonly dialogService = inject(TuiDialogService);
  private readonly injector = inject(INJECTOR);
  private readonly destroyRef = inject(DestroyRef);

  readonly inputData = input<Human[] | null>(null);
  
  readonly filterableColumns = [
    'id',
    'name',
    'coordinates',
    'impactSpeed',
    'soundTrackName',
    'minutesOfWaiting',
  ] as const;
  readonly filtersForm = new FormGroup<
    Partial<Record<keyof Human, FormControl>>
  >(
    this.filterableColumns.reduce(
      (prev, curr) => ({
        ...prev,
        [curr]: new FormControl(''),
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
    'coordinates',
    'creationDate',
    'realHero',
    'hasToothpick',
    'car',
    'mood',
    'impactSpeed',
    'soundTrackName',
    'minutesOfWaiting',
    'weaponType',
  ] as const;
  readonly columns = [...this.humanColumns, 'actions'] as const;
  readonly columnNames = {
    id: 'ID',
    name: 'Name',
    coordinates: 'Coordinates',
    creationDate: 'Creation Date',
    car: 'Car',
    realHero: 'Real Hero',
    hasToothpick: 'Has Toothpick',
    mood: 'Mood',
    impactSpeed: 'Impact Speed',
    soundTrackName: 'Sound Track Name',
    minutesOfWaiting: 'Minutes Of Waiting',
    weaponType: 'Weapon Type',
    actions: 'Actions',
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

        const getHumanListSubscription =
          interval(5000)
          .pipe(
            switchMap(() =>
              this.humanityService.getHumanList$({
                  page: this.page(),
                  size: this.pageSize,
              })
            ),
            tuiTakeUntilDestroyed(this.destroyRef)
          )
          .subscribe((response) => {
            this.data.set(response.content);
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

  edit(item: Human): void {
    this.dialogService
      .open<{ item: Human; mode: ActionWithHumans }>(
        new PolymorpheusComponent(HumanFormComponent, this.injector),
        {
          data: {
            item,
            mode: ActionWithHumans.Update,
          } as HumanFormDialogContext,
          dismissible: true,
          label: 'Edit Human',
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
            mode: ActionWithHumans.Read,
          },
          dismissible: true,
          label: 'View Human',
        }
      )
      .pipe(tuiTakeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
