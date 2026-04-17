import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EMPTY, catchError } from 'rxjs';

import { API_BASE_URL, LOGGER, SilentLogger } from '@core/tokens';

import { CyclesStore } from './cycles.store';

describe('CyclesStore', () => {
  let store: CyclesStore;
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
    store = TestBed.inject(CyclesStore);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  const flushCycles = () => {
    controller.expectOne('/api/cycles').flush([
      {
        id: '1',
        deviceId: '48565',
        userId: 'alex',
        userAgent: 'ua',
        status: 'in-progress',
        startedAt: '2024-11-25T12:00:00Z',
        stoppedAt: null,
        invoiceLines: [],
      },
      {
        id: '2',
        deviceId: '48567',
        userId: 'nick',
        userAgent: 'ua',
        status: 'completed',
        startedAt: '2024-11-26T12:00:00Z',
        stoppedAt: '2024-11-26T13:00:00Z',
        invoiceLines: [{ name: 'Wash', totalPrice: 2.5, currency: 'EUR' }],
      },
    ]);
  };

  describe('load()', () => {
    it('transitions idle → loading → loaded and populates cycles', () => {
      expect(store.status()).toBe('idle');

      store.load();
      expect(store.status()).toBe('loading');
      expect(store.loading()).toBe(true);

      flushCycles();

      expect(store.status()).toBe('loaded');
      expect(store.loaded()).toBe(true);
      expect(store.cycles().length).toBe(2);
      expect(store.activeCycles().length).toBe(1);
      expect(store.pastCycles().length).toBe(1);
    });

    it('sorts past cycles by startedAt desc', () => {
      store.load();
      controller.expectOne('/api/cycles').flush([
        {
          id: 'a',
          deviceId: '1',
          userId: 'u',
          userAgent: '',
          status: 'completed',
          startedAt: '2024-10-01T00:00:00Z',
          stoppedAt: '2024-10-01T01:00:00Z',
          invoiceLines: [],
        },
        {
          id: 'b',
          deviceId: '1',
          userId: 'u',
          userAgent: '',
          status: 'completed',
          startedAt: '2024-12-01T00:00:00Z',
          stoppedAt: '2024-12-01T01:00:00Z',
          invoiceLines: [],
        },
      ]);

      const ids = store.pastCycles().map((c) => c.id);
      expect(ids).toEqual(['b', 'a']);
    });

    it('records error and transitions to error state on failure', () => {
      store.load();
      controller
        .expectOne('/api/cycles')
        .flush(null, { status: 500, statusText: 'Server Error' });

      expect(store.status()).toBe('error');
      expect(store.hasError()).toBe(true);
      expect(store.error()?.category).toBe('server');
    });

    it('cancels in-flight request when load() is called again (switchMap)', () => {
      store.load();
      const first = controller.expectOne('/api/cycles');
      store.load();
      const second = controller.expectOne('/api/cycles');

      second.flush([]);
      expect(first.cancelled).toBe(true);
      expect(store.cycles()).toEqual([]);
    });
  });

  describe('createOptimistic()', () => {
    beforeEach(() => {
      store.load();
      flushCycles();
    });

    it('inserts optimistic cycle immediately and reconciles with persisted id on success', () => {
      const snapshotLength = store.cycles().length;

      store
        .createOptimistic({ deviceId: '48111', userId: 'u', userAgent: 'ua' })
        .subscribe();

      expect(store.cycles().length).toBe(snapshotLength + 1);
      expect(store.cycles()[0]!.id.startsWith('temp-')).toBe(true);

      const post = controller.expectOne('/api/cycles');
      expect(post.request.method).toBe('POST');
      post.flush({
        id: '99',
        deviceId: '48111',
        userId: 'u',
        userAgent: 'ua',
        status: 'in-progress',
        startedAt: '2024-12-01T10:00:00Z',
        stoppedAt: null,
        invoiceLines: [],
      });

      expect(store.cycles().length).toBe(snapshotLength + 1);
      expect(store.cycles().find((c) => c.id === '99')).toBeDefined();
      expect(store.cycles().find((c) => c.id.startsWith('temp-'))).toBeUndefined();
    });

    it('rolls back only the specific optimistic row on failure', () => {
      const snapshotIds = store.cycles().map((c) => c.id);

      store
        .createOptimistic({ deviceId: '48111', userId: 'u', userAgent: 'ua' })
        .pipe(catchError(() => EMPTY))
        .subscribe();

      controller
        .expectOne('/api/cycles')
        .flush(null, { status: 400, statusText: 'Bad Request' });

      expect(store.cycles().map((c) => c.id)).toEqual(snapshotIds);
    });
  });
});
