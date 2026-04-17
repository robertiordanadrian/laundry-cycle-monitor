import { Injectable, inject } from '@angular/core';
import { MatSnackBar, type MatSnackBarRef, type TextOnlySnackBar } from '@angular/material/snack-bar';

import { MESSAGES } from '@shared/i18n';

export type NotificationTone = 'success' | 'error' | 'info';

const DEFAULT_DURATION_MS: Readonly<Record<NotificationTone, number>> = {
  success: 3500,
  info: 4000,
  error: 6000,
};

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): MatSnackBarRef<TextOnlySnackBar> {
    return this.open(message, 'success');
  }

  error(message: string): MatSnackBarRef<TextOnlySnackBar> {
    return this.open(message, 'error');
  }

  info(message: string): MatSnackBarRef<TextOnlySnackBar> {
    return this.open(message, 'info');
  }

  private open(message: string, tone: NotificationTone): MatSnackBarRef<TextOnlySnackBar> {
    return this.snackBar.open(message, MESSAGES.errors.dismiss, {
      duration: DEFAULT_DURATION_MS[tone],
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['app-snack', `app-snack--${tone}`],
      politeness: tone === 'error' ? 'assertive' : 'polite',
    });
  }
}
