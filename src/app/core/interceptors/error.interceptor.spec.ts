import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { type ApiError } from '@core/models';
import { LOGGER, RETRY_CONFIG, SilentLogger } from '@core/tokens';

import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  const configureTest = (maxAttempts: number, initialDelayMs = 1000, backoffFactor = 2) => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: LOGGER, useValue: new SilentLogger() },
        {
          provide: RETRY_CONFIG,
          useValue: { maxAttempts, initialDelayMs, backoffFactor },
        },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  };

  it('does NOT retry on 4xx and maps to client ApiError', fakeAsync(() => {
    configureTest(3);
    let error: ApiError | undefined;
    http.get('/api/x').subscribe({ error: (err: ApiError) => (error = err) });

    controller.expectOne('/api/x').flush(null, { status: 400, statusText: 'Bad Request' });
    tick(5000);
    controller.verify();

    expect(error?.category).toBe('client');
    expect(error?.retryable).toBe(false);
  }));

  it('retries 500 with exponential backoff and eventually succeeds', fakeAsync(() => {
    configureTest(3, 1000, 2);
    let body: unknown;
    http.get('/api/x').subscribe((value) => (body = value));

    controller.expectOne('/api/x').flush(null, { status: 500, statusText: 'Server Error' });
    tick(1000);
    controller.expectOne('/api/x').flush(null, { status: 500, statusText: 'Server Error' });
    tick(2000);
    controller.expectOne('/api/x').flush({ ok: true });

    expect(body).toEqual({ ok: true });
    controller.verify();
  }));

  it('retries network errors (status 0)', fakeAsync(() => {
    configureTest(2, 500, 2);
    let body: unknown;
    http.get('/api/x').subscribe((v) => (body = v));

    controller.expectOne('/api/x').error(new ProgressEvent('error'), { status: 0, statusText: '' });
    tick(500);
    controller.expectOne('/api/x').flush({ ok: true });

    expect(body).toEqual({ ok: true });
    controller.verify();
  }));

  it('gives up after maxAttempts and emits a server ApiError', fakeAsync(() => {
    configureTest(2, 100, 1);
    let error: ApiError | undefined;
    http.get('/api/x').subscribe({ error: (err: ApiError) => (error = err) });

    controller.expectOne('/api/x').flush(null, { status: 503, statusText: 'Unavailable' });
    tick(100);
    controller.expectOne('/api/x').flush(null, { status: 503, statusText: 'Unavailable' });
    tick(100);

    expect(error?.category).toBe('server');
    expect(error?.retryable).toBe(true);
    controller.verify();
  }));
});
