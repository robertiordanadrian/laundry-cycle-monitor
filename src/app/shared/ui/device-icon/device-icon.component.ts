import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { type DeviceType } from '@core/models';

export type DeviceIconSize = 'sm' | 'md' | 'lg' | 'xl';

// Drum rotates when `animated` is true; honors `prefers-reduced-motion`.
@Component({
  selector: 'app-device-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './device-icon.component.html',
  styleUrl: './device-icon.component.scss',
  host: {
    '[attr.data-type]': 'type()',
    '[attr.data-size]': 'size()',
    '[class.device-icon--animated]': 'animated()',
    'aria-hidden': 'true',
    role: 'img',
  },
})
export class DeviceIconComponent {
  readonly type = input.required<DeviceType>();
  readonly animated = input<boolean>(false);
  readonly size = input<DeviceIconSize>('md');
}
