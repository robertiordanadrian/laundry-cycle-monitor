import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, switchMap, tap } from 'rxjs';

import { TariffsApi } from '@core/api';
import { toApiError } from '@core/mappers';
import { type ApiError, type StoreStatus, type Tariff, isApiError } from '@core/models';
import { LOGGER } from '@core/tokens';

@Injectable({ providedIn: 'root' })
export class TariffsStore {
  private readonly api = inject(TariffsApi);
  private readonly logger = inject(LOGGER);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _tariffs = signal<readonly Tariff[]>([]);
  private readonly _status = signal<StoreStatus>('idle');
  private readonly _error = signal<ApiError | null>(null);

  private readonly loadTrigger$ = new Subject<void>();

  readonly tariffs = this._tariffs.asReadonly();
  readonly status = this._status.asReadonly();
  readonly error = this._error.asReadonly();
  readonly loading = computed(() => this._status() === 'loading');
  readonly loaded = computed(() => this._status() === 'loaded');
  readonly hasError = computed(() => this._status() === 'error');

  readonly tariffsById = computed<ReadonlyMap<string, Tariff>>(
    () => new Map(this._tariffs().map((tariff) => [tariff.id, tariff] as const)),
  );

  constructor() {
    this.loadTrigger$
      .pipe(
        tap(() => {
          this._status.set('loading');
          this._error.set(null);
        }),
        switchMap(() =>
          this.api.list().pipe(
            catchError((cause: unknown) => {
              const apiError: ApiError = isApiError(cause) ? cause : toApiError(cause);
              this._error.set(apiError);
              this._status.set('error');
              this.logger.error('[tariffs.store] load failed', apiError);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((tariffs) => {
        this._tariffs.set(tariffs);
        this._status.set('loaded');
      });
  }

  load(): void {
    this.loadTrigger$.next();
  }
}
