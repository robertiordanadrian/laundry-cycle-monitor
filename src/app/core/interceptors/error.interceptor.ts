import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, retry, throwError, timer } from 'rxjs';

import { toApiError } from '@core/mappers';
import { LOGGER, RETRY_CONFIG } from '@core/tokens';

// Retry 5xx / network / 408 / 504 with exponential backoff; 4xx never retried.
// Final errors always surface as `ApiError`, never raw HttpErrorResponse.
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(RETRY_CONFIG);
  const logger = inject(LOGGER);

  return next(req).pipe(
    retry({
      count: Math.max(0, config.maxAttempts - 1),
      // retryIndex is 1-based (RxJS 7 passes the retry attempt count, not a zero-based index).
      delay: (error: unknown, retryIndex: number) => {
        if (!isRetryableError(error)) {
          return throwError(() => error);
        }
        const delayMs = config.initialDelayMs * config.backoffFactor ** (retryIndex - 1);
        logger.warn(
          `[http] retry ${retryIndex}/${config.maxAttempts - 1} after ${delayMs}ms — ${req.method} ${req.urlWithParams}`,
        );
        return timer(delayMs);
      },
    }),
    catchError((cause: unknown) => {
      const apiError = toApiError(cause);
      logger.error(`[http] ${req.method} ${req.urlWithParams} failed`, apiError);
      return throwError(() => apiError);
    }),
  );
};

const isRetryableError = (error: unknown): boolean => {
  if (!(error instanceof HttpErrorResponse)) {
    return false;
  }
  return error.status === 0 || error.status === 408 || error.status === 504 || error.status >= 500;
};
