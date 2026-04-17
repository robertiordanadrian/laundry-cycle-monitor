import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  type OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';

import { type ApiError, type Tariff } from '@core/models';
import { CyclesStore, CyclesViewStore, DevicesStore, TariffsStore } from '@core/state';
import { CURRENT_USER } from '@core/tokens';
import { MESSAGES } from '@shared/i18n';
import { MoneyPipe } from '@shared/pipes';
import { NotificationService } from '@shared/services';
import { EmptyStateComponent } from '@shared/ui/empty-state';
import { ErrorBoundaryComponent } from '@shared/ui/error-boundary';
import { SkeletonListComponent } from '@shared/ui/skeleton-list';

@Component({
  selector: 'app-create-cycle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink,
    MoneyPipe,
    EmptyStateComponent,
    ErrorBoundaryComponent,
    SkeletonListComponent,
  ],
  templateUrl: './create-cycle.component.html',
  styleUrl: './create-cycle.component.scss',
})
export class CreateCycleComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly currentUser = inject(CURRENT_USER);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cyclesStore = inject(CyclesStore);
  protected readonly devicesStore = inject(DevicesStore);
  protected readonly tariffsStore = inject(TariffsStore);
  protected readonly viewStore = inject(CyclesViewStore);

  protected readonly messages = MESSAGES.createCycle;

  protected readonly form = this.fb.group({
    deviceId: this.fb.control<string | null>(null, { validators: [Validators.required] }),
  });

  private readonly deviceIdControl = this.form.controls.deviceId;

  private readonly deviceIdSignal = toSignal(this.deviceIdControl.valueChanges, {
    initialValue: this.deviceIdControl.value,
  });

  protected readonly availableDevices = this.viewStore.availableDevices;

  protected readonly selectedTariff = computed<Tariff | null>(() => {
    const id = this.deviceIdSignal();
    if (id === null || id === '') {
      return null;
    }
    return this.viewStore.tariffByDeviceId().get(id) ?? null;
  });

  protected readonly submitting = signal(false);

  protected readonly blockingError = computed<ApiError | null>(
    () => this.devicesStore.error() ?? this.tariffsStore.error(),
  );

  protected readonly storesReady = computed(
    () => this.devicesStore.loaded() && this.tariffsStore.loaded(),
  );

  protected readonly canSubmit = computed(
    () =>
      !this.submitting() &&
      this.storesReady() &&
      this.availableDevices().length > 0 &&
      this.deviceIdSignal() !== null &&
      this.deviceIdSignal() !== '',
  );

  ngOnInit(): void {
    if (!this.devicesStore.loaded()) {
      this.devicesStore.load();
    }
    if (!this.tariffsStore.loaded()) {
      this.tariffsStore.load();
    }
    if (!this.cyclesStore.loaded()) {
      this.cyclesStore.load();
    }
  }

  protected submit(): void {
    if (!this.canSubmit()) {
      this.form.markAllAsTouched();
      return;
    }
    const { deviceId } = this.form.getRawValue();
    if (!deviceId) {
      return;
    }

    this.submitting.set(true);
    this.cyclesStore
      .createOptimistic({
        deviceId,
        userId: this.currentUser.userId,
        userAgent: this.currentUser.userAgent,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.notifications.success(this.messages.successToast);
          void this.router.navigate(['/cycles']);
        },
        error: (error: ApiError) => {
          this.submitting.set(false);
          this.notifications.error(error.message ?? this.messages.errorToast);
        },
      });
  }

  protected retryLoad(): void {
    this.devicesStore.load();
    this.tariffsStore.load();
    this.cyclesStore.load();
  }

  protected cancel(): void {
    void this.router.navigate(['/cycles']);
  }
}
