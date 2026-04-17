import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { type ApiError } from '@core/models';
import { MESSAGES } from '@shared/i18n';

@Component({
  selector: 'app-error-boundary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './error-boundary.component.html',
  styleUrl: './error-boundary.component.scss',
  host: {
    role: 'alert',
    'aria-live': 'assertive',
  },
})
export class ErrorBoundaryComponent {
  readonly error = input.required<ApiError>();
  readonly retryLabel = input<string>(MESSAGES.errors.retry);
  readonly showRetry = input<boolean>(true);

  readonly retry = output<void>();

  protected onRetry(): void {
    this.retry.emit();
  }
}
