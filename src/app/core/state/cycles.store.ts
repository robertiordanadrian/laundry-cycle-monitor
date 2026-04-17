import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, type Observable, Subject, catchError, shareReplay, switchMap, tap, throwError } from 'rxjs';

import { CyclesApi } from '@core/api';
import { toApiError } from '@core/mappers';
import {
  type ApiError,
  type CreateCycleInput,
  type Cycle,
  type StoreStatus,
  isApiError,
} from '@core/models';
import { LOGGER } from '@core/tokens';

// Optimistic insert rolls back the single temp row on failure — snapshot-restore
// would clobber concurrent in-flight writes.
@Injectable({ providedIn: 'root' })
export class CyclesStore {
  private readonly api = inject(CyclesApi);
  private readonly logger = inject(LOGGER);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _cycles = signal<readonly Cycle[]>([]);
  private readonly _status = signal<StoreStatus>('idle');
  private readonly _error = signal<ApiError | null>(null);

  private readonly loadTrigger$ = new Subject<void>();

  readonly cycles = this._cycles.asReadonly();
  readonly status = this._status.asReadonly();
  readonly error = this._error.asReadonly();
  readonly loading = computed(() => this._status() === 'loading');
  readonly loaded = computed(() => this._status() === 'loaded');
  readonly hasError = computed(() => this._status() === 'error');

  readonly activeCycles = computed(() =>
    this._cycles().filter((cycle) => cycle.status === 'in-progress'),
  );

  readonly pastCycles = computed(() =>
    [...this._cycles()]
      .filter((cycle) => cycle.status !== 'in-progress')
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime()),
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
              this.handleError(cause);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((cycles) => {
        this._cycles.set(cycles);
        this._status.set('loaded');
      });
  }

  load(): void {
    this.loadTrigger$.next();
  }

  createOptimistic(input: CreateCycleInput): Observable<Cycle> {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const optimistic: Cycle = {
      id: tempId,
      deviceId: input.deviceId,
      userId: input.userId,
      userAgent: input.userAgent,
      status: 'in-progress',
      startedAt: new Date(),
      stoppedAt: null,
      invoiceLines: [],
    };

    this._cycles.update((list) => [optimistic, ...list]);

    const request$ = this.api.create(input).pipe(
      tap((persisted) => {
        this._cycles.update((list) =>
          list.map((cycle) => (cycle.id === tempId ? persisted : cycle)),
        );
      }),
      catchError((cause: unknown) => {
        this._cycles.update((list) => list.filter((cycle) => cycle.id !== tempId));
        return throwError(() => cause);
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    // Store owns reconciliation regardless of whether the caller subscribes.
    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      error: (cause: unknown) => {
        this.logger.warn('[cycles.store] optimistic create rolled back', cause);
      },
    });

    return request$;
  }

  private handleError(cause: unknown): void {
    const apiError: ApiError = isApiError(cause) ? cause : toApiError(cause);
    this._error.set(apiError);
    this._status.set('error');
    this.logger.error('[cycles.store] load failed', apiError);
  }
}
