import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import {
  CYCLE_STATUS_LABEL,
  CYCLE_STATUS_TONE,
  type CycleStatus,
} from '@core/models';
import { MESSAGES } from '@shared/i18n';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
  host: {
    '[class.status-badge]': 'true',
    '[attr.data-tone]': 'tone()',
    '[attr.data-status]': 'status()',
    role: 'status',
  },
})
export class StatusBadgeComponent {
  readonly status = input.required<CycleStatus>();

  protected readonly label = computed(() => CYCLE_STATUS_LABEL[this.status()]);
  protected readonly tone = computed(() => CYCLE_STATUS_TONE[this.status()]);
  protected readonly ariaLabel = computed(
    () => `${MESSAGES.a11y.statusBadgePrefix} ${this.label()}`,
  );
}
