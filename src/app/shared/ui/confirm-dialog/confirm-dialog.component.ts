import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import { MESSAGES } from '@shared/i18n';

import { type ConfirmDialogInput } from './confirm-dialog.model';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  protected readonly messages = MESSAGES.confirm;
  protected readonly data = inject<ConfirmDialogInput>(MAT_DIALOG_DATA);
  private readonly dialogRef =
    inject<MatDialogRef<ConfirmDialogComponent, boolean>>(MatDialogRef);

  protected readonly tone = this.data.tone ?? 'neutral';
  protected readonly confirmLabel = this.data.confirmLabel ?? this.messages.defaultConfirm;
  protected readonly cancelLabel = this.data.cancelLabel ?? this.messages.defaultCancel;

  protected cancel(): void {
    this.dialogRef.close(false);
  }

  protected confirm(): void {
    this.dialogRef.close(true);
  }
}
