import { HttpEventType, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';

import { LOGGER } from '@core/tokens';

// Debug calls become no-ops in prod (logger is configured at 'error' level).
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LOGGER);
  const startedAt = performance.now();

  logger.debug(`[http] → ${req.method} ${req.urlWithParams}`);

  return next(req).pipe(
    tap((event) => {
      if (event.type === HttpEventType.Response) {
        const durationMs = Math.round(performance.now() - startedAt);
        logger.debug(
          `[http] ← ${req.method} ${req.urlWithParams} ${event.status} (${durationMs}ms)`,
        );
      }
    }),
  );
};
