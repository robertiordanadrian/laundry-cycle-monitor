import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL, LOGGER, SilentLogger } from '@core/tokens';

import { DevicesStore } from './devices.store';

describe('DevicesStore', () => {
  let store: DevicesStore;
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
    store = TestBed.inject(DevicesStore);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('loads devices and exposes devicesById Map', () => {
    store.load();
    controller.expectOne('/api/devices').flush([
      { id: '48565', type: 'washer', name: 'Big', tariffId: 1 },
      { id: '48111', type: 'dryer', name: 'Dryer', tariffId: 3 },
    ]);

    expect(store.devices().length).toBe(2);
    const byId = store.devicesById();
    expect(byId.get('48565')?.tariffId).toBe('1');
    expect(byId.get('48111')?.tariffId).toBe('3');
  });

  it('records error state on HTTP failure', () => {
    store.load();
    controller
      .expectOne('/api/devices')
      .flush(null, { status: 502, statusText: 'Bad Gateway' });

    expect(store.hasError()).toBe(true);
    expect(store.error()?.category).toBe('server');
  });
});
