import { HttpErrorResponse } from '@angular/common/http';

import { toApiError } from './api-error.mapper';

describe('toApiError', () => {
  it('classifies status 0 as network and marks retryable', () => {
    const err = toApiError(new HttpErrorResponse({ status: 0, url: '/api/cycles' }));
    expect(err.category).toBe('network');
    expect(err.retryable).toBe(true);
    expect(err.url).toBe('/api/cycles');
  });

  it('classifies 408 and 504 as timeout and retryable', () => {
    expect(toApiError(new HttpErrorResponse({ status: 408 })).category).toBe('timeout');
    expect(toApiError(new HttpErrorResponse({ status: 504 })).category).toBe('timeout');
    expect(toApiError(new HttpErrorResponse({ status: 408 })).retryable).toBe(true);
  });

  it('classifies 5xx as server and retryable', () => {
    const err = toApiError(new HttpErrorResponse({ status: 503 }));
    expect(err.category).toBe('server');
    expect(err.retryable).toBe(true);
  });

  it('classifies 4xx as client and NOT retryable', () => {
    const err = toApiError(new HttpErrorResponse({ status: 400 }));
    expect(err.category).toBe('client');
    expect(err.retryable).toBe(false);
  });

  it('classifies SyntaxError as parse', () => {
    const err = toApiError(new SyntaxError('bad json'));
    expect(err.category).toBe('parse');
    expect(err.retryable).toBe(false);
  });

  it('classifies arbitrary errors as unknown', () => {
    const err = toApiError(new Error('random'));
    expect(err.category).toBe('unknown');
    expect(err.retryable).toBe(false);
  });

  it('attaches a user-friendly message', () => {
    const err = toApiError(new HttpErrorResponse({ status: 500 }));
    expect(err.message.length).toBeGreaterThan(10);
    expect(err.message).not.toContain('stack');
  });
});
