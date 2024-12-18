import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import {
  TuiAlertService,
  TuiButton,
  TuiIcon,
  TuiLabel,
  TuiTextfieldComponent,
  TuiTextfieldDirective
} from '@taiga-ui/core';
import { environment } from '../../../environments/environment';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiInputFiles, TuiInputFilesDirective } from '@taiga-ui/kit';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-import-file-form',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TuiLabel,
    TuiTextfieldComponent,
    TuiTextfieldDirective,
    NgIf,
    TuiInputFiles,
    TuiInputFilesDirective,
    AsyncPipe,
    TuiButton,
    TuiIcon
  ],
  templateUrl: './import-file-form.component.html',
  styleUrl: './import-file-form.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportFileFormComponent {
  public readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly alertService = inject(TuiAlertService);

  protected readonly control = new FormControl<number | null>(
    null,
    Validators.required
  );

  importFile(id: string): void {
    this.http.get(
      `${ environment.apiUrl }/file/import/upload/${ id }`,
      {
        responseType: 'blob',
        headers: this.authService.getAuthHeaders(),
      }
    ).subscribe((blob: Blob) => {
      // Создаем URL объект из полученного blob
      const downloadUrl = window.URL.createObjectURL(blob);

      // Создаем ссылку и симулируем клик по ней
      const a = document.createElement('a');
      a.href = downloadUrl;

      // Устанавливаем атрибут 'download' с именем файла
      a.download = 'humans-import-' + id + '.json'; // Предположительно имя файла на сервере

      // Добавляем элемент на страницу и вызываем клик
      document.body.appendChild(a);
      a.click();

      // Удаляем элемент после загрузки
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    }, error => {
      console.error('Ошибка загрузки файла', error);
      this.alertService.open(`File import error`, { appearance: "negative"}).subscribe();
    });
  }

}
