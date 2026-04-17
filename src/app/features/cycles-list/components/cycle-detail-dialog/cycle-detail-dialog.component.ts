import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { DEVICE_TYPE_LABEL, type CycleViewModel } from '@core/models';
import { MESSAGES } from '@shared/i18n';
import { DurationPipe, MoneyPipe, RelativeTimePipe } from '@shared/pipes';
import { DeviceIconComponent } from '@shared/ui/device-icon';
import { StatusBadgeComponent } from '@shared/ui/status-badge';

import { parseUserAgent } from './user-agent.util';

@Component({
  selector: 'app-cycle-detail-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    DatePipe,
    DurationPipe,
    MoneyPipe,
    RelativeTimePipe,
    DeviceIconComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './cycle-detail-dialog.component.html',
  styleUrl: './cycle-detail-dialog.component.scss',
})
export class CycleDetailDialogComponent {
  protected readonly viewModel = inject<CycleViewModel>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<CycleDetailDialogComponent>>(MatDialogRef);

  protected readonly messages = MESSAGES.cycleDetail;
  protected readonly deviceLabel = DEVICE_TYPE_LABEL;

  protected readonly parsedUserAgent = computed(() => parseUserAgent(this.viewModel.cycle.userAgent));

  protected close(): void {
    this.dialogRef.close();
  }
}
