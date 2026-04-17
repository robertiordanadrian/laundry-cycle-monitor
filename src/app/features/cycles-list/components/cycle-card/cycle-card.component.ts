import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { DEVICE_TYPE_LABEL, type CycleViewModel } from '@core/models';
import { MESSAGES } from '@shared/i18n';
import { DurationPipe, MoneyPipe, RelativeTimePipe } from '@shared/pipes';
import { DeviceIconComponent } from '@shared/ui/device-icon';
import { StatusBadgeComponent } from '@shared/ui/status-badge';

@Component({
  selector: 'app-cycle-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    StatusBadgeComponent,
    DeviceIconComponent,
    RelativeTimePipe,
    MoneyPipe,
    DurationPipe,
  ],
  templateUrl: './cycle-card.component.html',
  styleUrl: './cycle-card.component.scss',
  host: {
    '[attr.data-cycle-id]': 'viewModel().cycle.id',
    '[attr.data-status]': 'viewModel().cycle.status',
    '[attr.aria-label]': 'ariaLabel()',
    '[class.cycle-card--active]': 'viewModel().isActive',
    '[class.cycle-card--optimistic]': 'viewModel().cycle.id.startsWith("temp-")',
    role: 'button',
    tabindex: '0',
    '(click)': 'onActivate()',
    '(keydown.enter)': 'onActivate()',
    '(keydown.space)': 'onSpace($event)',
  },
})
export class CycleCardComponent {
  readonly viewModel = input.required<CycleViewModel>();
  readonly activate = output<CycleViewModel>();

  protected readonly messages = MESSAGES.cycleCard;
  protected readonly deviceLabel = DEVICE_TYPE_LABEL;

  protected readonly ariaLabel = computed(() => {
    const vm = this.viewModel();
    const deviceName = vm.device?.name ?? this.messages.unknownDevice;
    return `${this.messages.openDetails}: ${deviceName}, ${vm.cycle.status}`;
  });

  protected onActivate(): void {
    this.activate.emit(this.viewModel());
  }

  protected onSpace(event: Event): void {
    event.preventDefault();
    this.onActivate();
  }
}
