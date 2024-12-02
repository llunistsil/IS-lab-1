import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal } from '@angular/core';
import {
  TuiAlertService,
  TuiButton,
  TuiDialogContext,
  TuiError,
  TuiLoader,
  TuiSelect,
  TuiTextfield
} from '@taiga-ui/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TUI_VALIDATION_ERRORS, TuiCheckbox, TuiFieldErrorPipe, TuiStepper } from '@taiga-ui/kit';
import { AsyncPipe } from '@angular/common';
import { HumanityService } from '../humanity.service';
import { ActionWithHumans, Human } from '../models/human';
import { injectContext } from '@taiga-ui/polymorpheus';
import { TuiInputDateModule, TuiSelectModule } from '@taiga-ui/legacy';
import { Car } from '../models/car';
import { catchError, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export type HumanFormDialogContext = {
  mode: ActionWithHumans;
  item?: any;
};

@Component({
  selector: 'app-human-form',
  standalone: true,
  imports: [
    TuiTextfield,
    ReactiveFormsModule,
    TuiButton,
    TuiLoader,
    TuiSelect,
    TuiFieldErrorPipe,
    AsyncPipe,
    TuiInputDateModule,
    TuiError,
    TuiSelectModule,
    TuiCheckbox,
    TuiStepper,
    FormsModule
  ],
  providers: [
    {
      provide: TUI_VALIDATION_ERRORS,
      useValue: {
        minlength: ({ requiredLength }: { requiredLength: string }): string =>
          `At least ${ requiredLength } characters`,
        required: 'Required',
        min: 'Should be greater than zero'
      }
    }
  ],
  templateUrl: './human-form.component.html',
  styleUrls: ['./human-form.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HumanFormComponent {
  protected readonly context = injectContext<TuiDialogContext<void, HumanFormDialogContext>>();
  protected readonly fb = inject(FormBuilder);
  protected readonly humanityService = inject(HumanityService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly alertService = inject(TuiAlertService);
  protected activeIndex = 0;
  public accessAdmin = false;
  private humanId!: number;

  humanForm?: FormGroup;
  carForm?: FormGroup;

  isLoading = signal(true);

  get isEditable(): boolean {
    return [ActionWithHumans.Update, ActionWithHumans.Create].includes(this.context.data.mode);
  }

  constructor() {
    effect(() => {
      this.humanId = this.context.data.item?.id;

      this.humanForm = this.fb.group({
        name: [this.context.data.item?.name ?? null, [Validators.required, Validators.minLength(1)]],
        coordinates: this.fb.group({
          x: [this.context.data.item?.coordinates.x ?? null, Validators.required],
          y: [this.context.data.item?.coordinates.y ?? null, Validators.required]
        }),
        realHero: [this.context.data.item?.realHero ?? false],
        hasToothpick: [this.context.data.item?.hasToothpick?? false, Validators.required],
        mood: [this.context.data.item?.mood ?? null, Validators.required],
        impactSpeed: [this.context.data.item?.impactSpeed ?? null, Validators.min(0)],
        soundtrackName: [this.context.data.item?.soundtrackName ?? null, Validators.required],
        minutesOfWaiting: [this.context.data.item?.minutesOfWaiting ?? null, Validators.required],
        weaponType: [this.context.data.item?.weaponType ?? null, Validators.required]
      });

      this.carForm = this.fb.group({
        name: [this.context.data.item?.car?.name ?? null, [Validators.required, Validators.minLength(1)]],
        cool: [this.context.data.item?.car?.cool ?? false]
      });

      if (this.context.data.mode === ActionWithHumans.Read) {
        this.humanForm.disable();
        this.carForm.disable();
      } else {
        this.humanForm.markAllAsTouched();
        this.carForm.markAllAsTouched();
      }

      this.isLoading.set(false);
    }, { allowSignalWrites: true });
  }

  save(): void {
    const formValues = this.humanForm!.value;
    const human: Human = {
      ...formValues,
      coordinates: {
        x: formValues.coordinates.x,
        y: formValues.coordinates.y
      },
      creationDate: new Date(formValues.creationDate)
    };

    switch (this.context.data.mode) {
      case ActionWithHumans.Create:
        this.humanityService.createHuman$(human)
          .pipe(
            switchMap(
              (response) => {
                this.humanId = response.id;
                console.log(this.accessAdmin)
                if (this.accessAdmin) {
                  return this.humanityService.accessAdmin$(this.humanId);
                }
                return this.humanityService.disAccessAdmin$(this.humanId);
              }),
            tap(() => this.activeIndex = 1),
            catchError((err: Error) => {
              return this.alertService
                .open(err.name, { appearance: 'error' })
                .pipe(takeUntilDestroyed(this.destroyRef));
            }),
          )
          .subscribe();
        break;
      case ActionWithHumans.Update:
        human.id = this.context.data.item?.id as number;
        this.humanityService.updateHuman$(human)
          .pipe(
            catchError(() => {
              return this.alertService
                .open('Update error: Access Denied', { appearance: 'error' })
                .pipe(takeUntilDestroyed(this.destroyRef));
            })
          ).subscribe();
        break;
    }
  }

  saveCar(): void {
    const formValues = this.carForm!.value;
    const car: Car = { ...formValues };

    if (!this.context.data.item?.car) {
      this.context.data.mode = ActionWithHumans.Create;
    } else {
      car.id = this.context.data.item.car.id;
    }



    switch (this.context.data.mode) {
      case ActionWithHumans.Create:
        this.humanityService.createCar$(car).pipe(
          tap(() => this.context.completeWith()),
          switchMap(res => {
            return this.humanityService.attachCar$(this.humanId, res.id);
          }),
        )
          .subscribe();
        break;
      case ActionWithHumans.Update:
        this.humanityService.updateCar$(car).subscribe();
        break;
    }
  }

  cancel(): void {
    this.context.completeWith();
  }
}