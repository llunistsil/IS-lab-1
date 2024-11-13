import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { TuiButton, TuiDialogContext, TuiError, TuiLoader, TuiSelect, TuiTextfield } from '@taiga-ui/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TUI_VALIDATION_ERRORS, TuiCheckbox, TuiFieldErrorPipe } from '@taiga-ui/kit';
import { AsyncPipe } from '@angular/common';
import { HumanityService } from '../humanity.service';
import { ActionWithHumans, Coordinates, Human, Mood, WeaponType } from '../models/human';
import { toSignal } from '@angular/core/rxjs-interop';
import { injectContext } from '@taiga-ui/polymorpheus';
import { TuiInputDateModule, TuiSelectModule } from '@taiga-ui/legacy';

export type HumanFormDialogContext = {
  mode: ActionWithHumans;
  item?: Human;
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
    TuiCheckbox
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
  protected readonly humanService = inject(HumanityService);

  humanForm?: FormGroup;
  isLoading = signal(true);

  cars = toSignal(this.humanService.getCarList$());

  get isEditable(): boolean {
    return [ActionWithHumans.Update, ActionWithHumans.Create].includes(this.context.data.mode);
  }

  constructor() {
    effect(() => {
      const dependencies = {
        cars: this.cars()!.content,
      };

      if (Object.values(dependencies).some((dependency) => !dependency)) {
        return;
      }

      const human: Human | undefined = this.context.data.item;

      this.humanForm = this.fb.group({
        id: [human?.id ?? ''],
        name: [human?.name ?? '', [Validators.required, Validators.minLength(1)]],
        coordinates: {
          x: [human?.coordinates.x ?? 0, Validators.required],
          y: [human?.coordinates.y ?? 0, Validators.required],
        },
        creationDate: [human?.creationDate ?? null, Validators.required],
        realHero: [human?.realHero ?? false],
        hasToothpick: [human?.hasToothpick ?? false, Validators.required],
        car: this.fb.group({
          id: [dependencies.cars[0].id, Validators.required],
          name: [dependencies.cars[0].name, [Validators.required, Validators.minLength(1)]],
          cool: [dependencies.cars[0].cool],
        }),
        mood: [human?.mood, Validators.required],
        impactSpeed: [human?.impactSpeed, Validators.min(0)],
        soundTrackName: [human?.soundTrackName, Validators.required],
        minutesOfWaiting: [human?.minutesOfWaiting, Validators.required],
        weaponType: [human?.weaponType, Validators.required],
      });

      if (this.context.data.mode === ActionWithHumans.Read) {
        this.humanForm.disable();
      } else {
        this.humanForm.markAllAsTouched();
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
      car: {
        id: formValues.car.id,
        name: formValues.car.name,
        cool: formValues.car.cool,
      },
    };

    switch (this.context.data.mode) {
      case ActionWithHumans.Create:
        this.humanService.createHuman$(human).subscribe({
          complete: () => this.context.completeWith(),
        });
        break;
      case ActionWithHumans.Update:
        this.humanService.updateHuman$(human).subscribe({
          complete: () => this.context.completeWith(),
        });
        break;
    }
  }

  cancel(): void {
    this.context.completeWith();
  }
}