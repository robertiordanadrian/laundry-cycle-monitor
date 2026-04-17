import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { type DeviceType } from '@core/models';
import { DeviceIconComponent } from '@shared/ui/device-icon';

export type EmptyStateIllustration = DeviceType | 'history' | null;

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, DeviceIconComponent],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  host: {
    role: 'status',
    'aria-live': 'polite',
  },
})
export class EmptyStateComponent {
  readonly icon = input<string>('inbox');
  readonly illustration = input<EmptyStateIllustration>(null);
  readonly title = input.required<string>();
  readonly message = input<string>('');
  readonly ctaLabel = input<string | null>(null);

  readonly ctaClick = output<void>();

  protected onCta(): void {
    this.ctaClick.emit();
  }
}
