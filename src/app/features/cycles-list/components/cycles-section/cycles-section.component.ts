import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { type ApiError, type CycleViewModel } from '@core/models';
import { EmptyStateComponent, type EmptyStateIllustration } from '@shared/ui/empty-state';
import { ErrorBoundaryComponent } from '@shared/ui/error-boundary';
import { SkeletonListComponent } from '@shared/ui/skeleton-list';

import { CycleCardComponent } from '../cycle-card';

// One instance per tab — a failure in Active must not hide History (and vice versa).
@Component({
  selector: 'app-cycles-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CycleCardComponent, SkeletonListComponent, EmptyStateComponent, ErrorBoundaryComponent],
  templateUrl: './cycles-section.component.html',
  styleUrl: './cycles-section.component.scss',
})
export class CyclesSectionComponent {
  readonly items = input.required<readonly CycleViewModel[]>();
  readonly loading = input.required<boolean>();
  readonly error = input<ApiError | null>(null);

  readonly emptyTitle = input.required<string>();
  readonly emptyMessage = input<string>('');
  readonly emptyCtaLabel = input<string | null>(null);
  readonly emptyIcon = input<string>('local_laundry_service');
  readonly emptyIllustration = input<EmptyStateIllustration>(null);

  readonly retry = output<void>();
  readonly emptyCta = output<void>();
  readonly activate = output<CycleViewModel>();
}
