import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '@core/tokens';

import { TariffsApi } from './tariffs.api';

describe('TariffsApi', () => {
  let api: TariffsApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    api = TestBed.inject(TariffsApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('GETs /tariffs and maps DTOs', () => {
    let received: readonly { id: string; price: number }[] = [];
    api.list().subscribe((tariffs) => {
      received = tariffs.map((t) => ({ id: t.id, price: t.price }));
    });

    const req = http.expectOne('/api/tariffs');
    req.flush([
      { id: '1', name: 'Big', price: 3.5, currency: 'EUR' },
      { id: '2', name: 'Small', price: 2.5, currency: 'EUR' },
    ]);

    expect(received).toEqual([
      { id: '1', price: 3.5 },
      { id: '2', price: 2.5 },
    ]);
  });
});
