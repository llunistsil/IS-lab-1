import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { TuiButton, TuiDialogContext, TuiError, TuiLoader, TuiSelect, TuiTextfield } from '@taiga-ui/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TUI_VALIDATION_ERRORS, TuiCheckbox, TuiFieldErrorPipe, TuiStepper } from '@taiga-ui/kit';
import { AsyncPipe } from '@angular/common';
import { HumanityService } from '../humanity.service';
import { ActionWithHumans, Human } from '../models/human';
import { injectContext } from '@taiga-ui/polymorpheus';
import { TuiInputDateModule, TuiSelectModule } from '@taiga-ui/legacy';
import { Car } from '../models/car';

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
    TuiStepper
  ],
  providers: [
    {
      provide: TUI_VALIDATION_ERRORS,
      useValue: {
        minlength: ({ requiredLength }: { requiredLength: string }): string =>
          `At least ${requiredLength} characters`,
        required: 'Required',
        min: 'Should be greater than zero',
      },
    },
  ],
  templateUrl: './human-form.component.html',
  styleUrls: ['./human-form.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HumanFormComponent {
  protected readonly context = injectContext<TuiDialogContext<void, HumanFormDialogContext>>();
  protected readonly fb = inject(FormBuilder);
  protected readonly humanityService = inject(HumanityService);
  protected activeIndex = 0;

  humanForm?: FormGroup;
  carForm?: FormGroup;

  isLoading = signal(true);

  get isEditable(): boolean {
    return [ActionWithHumans.Update, ActionWithHumans.Create].includes(this.context.data.mode);
  }

  constructor() {
    effect(() => {

      this.humanForm = this.fb.group({
        name: [this.context.data.item?.name ?? null, [Validators.required, Validators.minLength(1)]],
        coordinates:  this.fb.group({
          x: [this.context.data.item?.coordinates.x ?? null, Validators.required],
          y: [this.context.data.item?.coordinates.y ?? null, Validators.required],
        }),
        creationDate: [this.context.data.item?.creation_date ?? null, Validators.required],
        realHero: [this.context.data.item?.real_hero ?? false],
        hasToothpick: [this.context.data.item?.has_toothpick ?? false, Validators.required],
        mood: [this.context.data.item?.mood ?? null, Validators.required],
        impactSpeed: [this.context.data.item?.impact_speed ?? null, Validators.min(0)],
        soundTrackName: [this.context.data.item?.soundtrack_name ?? null, Validators.required],
        minutesOfWaiting: [this.context.data.item?.minutes_of_waiting ?? null, Validators.required],
        weaponType: [this.context.data.item?.weapon_type ?? null, Validators.required],
      });

      this.carForm = this.fb.group({
        name: [this.context.data.item?.car?.name ?? null, [Validators.required, Validators.minLength(1)]],
        cool: [this.context.data.item?.car?.cool ?? false],
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
        y: formValues.coordinates.y,
      },
      creationDate: new Date(formValues.creationDate),
    };

    switch (this.context.data.mode) {
      case ActionWithHumans.Create:
        this.humanityService.createHuman$(human).subscribe({
          complete: () => this.context.completeWith(),
        });
        break;
      case ActionWithHumans.Update:
        this.humanityService.updateHuman$(human).subscribe({
          complete: () => this.context.completeWith(),
        });
        break;
    }
  }

  saveCar(): void {
    const formValues = this.carForm!.value;
    const car: Car = { ...formValues };

    switch (this.context.data.mode) {
      case ActionWithHumans.Create:
        this.humanityService.createCar$(car).subscribe({
          complete: () => this.context.completeWith(),
        });
        break;
      case ActionWithHumans.Update:
        this.humanityService.updateCar$(car).subscribe({
          complete: () => this.context.completeWith(),
        });
        break;
    }
  }

  cancel(): void {
    this.context.completeWith();
  }
}