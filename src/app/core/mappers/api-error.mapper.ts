import { HttpErrorResponse } from '@angular/common/http';

import { type ApiError, type ApiErrorCategory } from '@core/models';

const USER_FRIENDLY_MESSAGES: Readonly<Record<ApiErrorCategory, string>> = Object.freeze({
  network: 'Could not reach the laundry service. Check your connection and try again.',
  timeout: 'The laundry service took too long to respond. Please try again.',
  server: 'The laundry service is temporarily unavailable. Please try again in a moment.',
  client: 'That request was not accepted. Please review the form and try again.',
  parse: 'Received an unexpected response from the laundry service.',
  unknown: 'Something went wrong. Please try again.',
});

const categorize = (status: number): ApiErrorCategory => {
  if (status === 0) {
    return 'network';
  }
  if (status === 408 || status === 504) {
    return 'timeout';
  }
  if (status >= 500) {
    return 'server';
  }
  if (status >= 400) {
    return 'client';
  }
  return 'unknown';
};

export const toApiError = (cause: unknown): ApiError => {
  if (cause instanceof HttpErrorResponse) {
    const category = categorize(cause.status);
    return {
      category,
      status: cause.status,
      message: USER_FRIENDLY_MESSAGES[category],
      url: cause.url,
      retryable: category === 'network' || category === 'server' || category === 'timeout',
      at: new Date(),
      cause,
    };
  }
  if (cause instanceof SyntaxError) {
    return {
      category: 'parse',
      status: 0,
      message: USER_FRIENDLY_MESSAGES.parse,
      url: null,
      retryable: false,
      at: new Date(),
      cause,
    };
  }
  return {
    category: 'unknown',
    status: 0,
    message: USER_FRIENDLY_MESSAGES.unknown,
    url: null,
    retryable: false,
    at: new Date(),
    cause,
  };
};
