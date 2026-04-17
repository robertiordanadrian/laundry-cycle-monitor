import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL, LOGGER, SilentLogger } from '@core/tokens';

import { TariffsStore } from './tariffs.store';

describe('TariffsStore', () => {
  let store: TariffsStore;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: LOGGER, useValue: new SilentLogger() },
      ],
    });
    store = TestBed.inject(TariffsStore);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('loads tariffs and exposes tariffsById Map', () => {
    store.load();
    controller.expectOne('/api/tariffs').flush([
      { id: '1', name: 'Big', price: 3.5, currency: 'EUR' },
      { id: '2', name: 'Small', price: 2.5, currency: 'EUR' },
    ]);

    expect(store.tariffs().length).toBe(2);
    expect(store.tariffsById().get('1')?.price).toBe(3.5);
    expect(store.loaded()).toBe(true);
  });

  it('records error state on HTTP failure', () => {
    store.load();
    controller
      .expectOne('/api/tariffs')
      .flush(null, { status: 500, statusText: 'Server Error' });

    expect(store.hasError()).toBe(true);
  });
});
