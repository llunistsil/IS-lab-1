import { Component, DestroyRef, effect, inject, INJECTOR, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiButton, TuiDialogService, TuiLink, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { RouterLink } from '@angular/router';
import { TuiAccordion, TuiStatus } from '@taiga-ui/kit';
import { TuiTable, TuiTableFilters, TuiTablePagination } from '@taiga-ui/addon-table';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActionWithHumans, Human } from './models/human';
import { HumanityService } from './humanity.service';
import { TuiLet, tuiTakeUntilDestroyed } from '@taiga-ui/cdk';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { HumanFormComponent, HumanFormDialogContext } from './human-form/human-form.component';
import { switchMap, timer } from 'rxjs';

@Component({
  selector: 'app-humanity',
  standalone: true,
  imports: [CommonModule, TuiLink, RouterLink, TuiAccordion, TuiTableFilters, ReactiveFormsModule, TuiLoader, TuiTable, TuiTextfield, TuiTablePagination, TuiStatus, TuiButton, TuiLet],
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
    'impact_speed',
    'soundtrack_name',
    'minutes_of_waiting',
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
    'real_hero',
    'has_toothpick',
    'mood',
    'impact_speed',
    'soundtrack_name',
    'minutes_of_waiting',
    'weapon_type',
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
          timer(0,5000)
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

  edit(item: any): void {
    this.dialogService
      .open<{ item: any; mode: ActionWithHumans }>(
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
