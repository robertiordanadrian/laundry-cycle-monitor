import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

import { ConfirmDialogComponent, type ConfirmDialogInput } from '@shared/ui/confirm-dialog';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly dialog = inject(MatDialog);

  async confirm(input: ConfirmDialogInput): Promise<boolean> {
    const ref = this.dialog.open<ConfirmDialogComponent, ConfirmDialogInput, boolean>(
      ConfirmDialogComponent,
      {
        data: input,
        autoFocus: 'first-tabbable',
        restoreFocus: true,
        panelClass: 'app-confirm-dialog-panel',
        width: '28rem',
        maxWidth: '92vw',
      },
    );
    const result = await firstValueFrom(ref.afterClosed());
    return result === true;
  }
}
