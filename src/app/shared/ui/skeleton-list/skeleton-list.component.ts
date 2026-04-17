import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { MESSAGES } from '@shared/i18n';

@Component({
  selector: 'app-skeleton-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './skeleton-list.component.html',
  styleUrl: './skeleton-list.component.scss',
  host: {
    role: 'status',
    'aria-busy': 'true',
    '[attr.aria-label]': 'ariaLabel',
  },
})
export class SkeletonListComponent {
  readonly count = input<number>(3);
  readonly variant = input<'card' | 'line'>('card');

  protected readonly items = computed(() =>
    Array.from({ length: Math.max(1, this.count()) }, (_, index) => index),
  );

  protected readonly ariaLabel = MESSAGES.a11y.skeleton;

  protected trackByIndex(_index: number, item: number): number {
    return item;
  }
}
