import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '@core/tokens';

import { CyclesApi } from './cycles.api';

describe('CyclesApi', () => {
  let api: CyclesApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    api = TestBed.inject(CyclesApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('GETs /cycles and maps DTOs to domain', () => {
    let received: readonly { id: string; status: string }[] = [];
    api.list().subscribe((cycles) => {
      received = cycles.map((c) => ({ id: c.id, status: c.status }));
    });

    const req = http.expectOne('/api/cycles');
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        id: '1',
        deviceId: '48565',
        userId: 'alex',
        userAgent: 'ua',
        status: 'completed',
        startedAt: '2024-11-25T12:00:00.000Z',
        stoppedAt: '2024-11-25T13:00:00.000Z',
        invoiceLines: [],
      },
    ]);

    expect(received).toEqual([{ id: '1', status: 'completed' }]);
  });

  it('POSTs /cycles with the builder payload and maps response', () => {
    const now = new Date('2024-12-01T10:00:00Z');
    let createdId: string | undefined;
    api
      .create({ deviceId: '48565', userId: 'web-user', userAgent: 'ua' }, now)
      .subscribe((c) => {
        createdId = c.id;
      });

    const req = http.expectOne('/api/cycles');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      deviceId: '48565',
      userId: 'web-user',
      userAgent: 'ua',
      status: 'in-progress',
      startedAt: '2024-12-01T10:00:00.000Z',
      stoppedAt: null,
      invoiceLines: [],
    });
    req.flush({
      id: '10',
      deviceId: '48565',
      userId: 'web-user',
      userAgent: 'ua',
      status: 'in-progress',
      startedAt: '2024-12-01T10:00:00.000Z',
      stoppedAt: null,
      invoiceLines: [],
    });

    expect(createdId).toBe('10');
  });
});
