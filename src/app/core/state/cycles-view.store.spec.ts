import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL, LOGGER, SilentLogger } from '@core/tokens';

import { CyclesStore } from './cycles.store';
import { CyclesViewStore } from './cycles-view.store';
import { DevicesStore } from './devices.store';
import { TariffsStore } from './tariffs.store';

describe('CyclesViewStore', () => {
  let view: CyclesViewStore;
  let cyclesStore: CyclesStore;
  let devicesStore: DevicesStore;
  let tariffsStore: TariffsStore;
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
    view = TestBed.inject(CyclesViewStore);
    cyclesStore = TestBed.inject(CyclesStore);
    devicesStore = TestBed.inject(DevicesStore);
    tariffsStore = TestBed.inject(TariffsStore);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  const loadAllFixtures = () => {
    cyclesStore.load();
    devicesStore.load();
    tariffsStore.load();

    controller.expectOne('/api/cycles').flush([
      {
        id: 'active-1',
        deviceId: '48567',
        userId: 'michi',
        userAgent: '',
        status: 'in-progress',
        startedAt: '2024-11-28T12:00:00Z',
        stoppedAt: null,
        invoiceLines: [],
      },
      {
        id: 'done-1',
        deviceId: '48565',
        userId: 'nick',
        userAgent: '',
        status: 'completed',
        startedAt: '2024-11-27T12:00:00Z',
        stoppedAt: '2024-11-27T13:00:00Z',
        invoiceLines: [{ name: 'Wash', totalPrice: 3.5, currency: 'EUR' }],
      },
    ]);
    controller.expectOne('/api/devices').flush([
      { id: '48565', type: 'washer', name: 'Big washer', tariffId: 1 },
      { id: '48567', type: 'washer', name: 'Small washer', tariffId: 2 },
      { id: '48111', type: 'dryer', name: 'Dryer', tariffId: 3 },
    ]);
    controller.expectOne('/api/tariffs').flush([
      { id: '1', name: 'Big tariff', price: 3.5, currency: 'EUR' },
      { id: '2', name: 'Small tariff', price: 2.5, currency: 'EUR' },
      { id: '3', name: 'Drying', price: 1.5, currency: 'EUR' },
    ]);
  };

  it('joins cycle ⊕ device ⊕ tariff per view model', () => {
    loadAllFixtures();

    const activeVm = view.activeViewModels()[0]!;
    expect(activeVm.cycle.id).toBe('active-1');
    expect(activeVm.device?.name).toBe('Small washer');
    expect(activeVm.tariff?.price).toBe(2.5);
    expect(activeVm.isActive).toBe(true);
  });

  it('excludes devices with an in-progress cycle from availableDevices', () => {
    loadAllFixtures();

    const available = view.availableDevices().map((d) => d.id);
    expect(available).not.toContain('48567');
    expect(available).toContain('48565');
    expect(available).toContain('48111');
  });

  it('exposes tariffByDeviceId resolving the number↔string tariffId quirk', () => {
    loadAllFixtures();

    const map = view.tariffByDeviceId();
    expect(map.get('48565')?.name).toBe('Big tariff');
    expect(map.get('48111')?.name).toBe('Drying');
  });

  it('anyLoading aggregates the three stores', () => {
    expect(view.anyLoading()).toBe(false);
    cyclesStore.load();
    expect(view.anyLoading()).toBe(true);
    controller.expectOne('/api/cycles').flush([]);
    expect(view.anyLoading()).toBe(false);
  });

  it('pastViewModels returns completed cycles sorted newest first', () => {
    loadAllFixtures();
    const past = view.pastViewModels();
    expect(past.map((vm) => vm.cycle.id)).toEqual(['done-1']);
  });

  it('anyLoaded becomes true only after all three stores have loaded', () => {
    expect(view.anyLoaded()).toBe(false);
    loadAllFixtures();
    expect(view.anyLoaded()).toBe(true);
  });

  it('loadAll triggers one GET per store', () => {
    view.loadAll();
    controller.expectOne('/api/cycles').flush([]);
    controller.expectOne('/api/devices').flush([]);
    controller.expectOne('/api/tariffs').flush([]);
    expect(view.anyLoaded()).toBe(true);
  });

  it('tariffByDeviceId omits devices whose tariff has not loaded', () => {
    cyclesStore.load();
    devicesStore.load();
    tariffsStore.load();
    controller.expectOne('/api/cycles').flush([]);
    controller.expectOne('/api/devices').flush([
      { id: '48565', type: 'washer', name: 'Big', tariffId: 999 },
    ]);
    controller.expectOne('/api/tariffs').flush([]);

    const map = view.tariffByDeviceId();
    expect(map.has('48565')).toBe(false);
  });
});
