import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '@core/tokens';

import { DevicesApi } from './devices.api';

describe('DevicesApi', () => {
  let api: DevicesApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    api = TestBed.inject(DevicesApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('GETs /devices and normalizes numeric tariffId to string', () => {
    let received: readonly { id: string; tariffId: string }[] = [];
    api.list().subscribe((devices) => {
      received = devices.map((d) => ({ id: d.id, tariffId: d.tariffId }));
    });

    const req = http.expectOne('/api/devices');
    req.flush([
      { id: '48565', type: 'washer', name: 'Big', tariffId: 1 },
      { id: '48111', type: 'dryer', name: 'Dryer', tariffId: 3 },
    ]);

    expect(received).toEqual([
      { id: '48565', tariffId: '1' },
      { id: '48111', tariffId: '3' },
    ]);
  });
});
