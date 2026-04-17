import { type Cycle, type Device, type Tariff } from '@core/models';

import { toCycleViewModel } from './cycle-view.mapper';

describe('toCycleViewModel', () => {
  const device: Device = { id: '48565', type: 'washer', name: 'Big washer', tariffId: '1' };
  const tariff: Tariff = { id: '1', name: 'Big tariff', price: 3.5, currency: 'EUR' };

  const devicesById = new Map([[device.id, device]]);
  const tariffsById = new Map([[tariff.id, tariff]]);

  const baseCycle: Cycle = {
    id: 'c1',
    deviceId: '48565',
    userId: 'nick',
    userAgent: '',
    status: 'completed',
    startedAt: new Date('2024-11-25T12:00:00Z'),
    stoppedAt: new Date('2024-11-25T13:00:00Z'),
    invoiceLines: [{ name: 'Wash', totalPrice: 3.5, currency: 'EUR' }],
  };

  it('joins device and tariff via deviceId → tariffId chain', () => {
    const vm = toCycleViewModel(baseCycle, devicesById, tariffsById);
    expect(vm.device).toEqual(device);
    expect(vm.tariff).toEqual(tariff);
  });

  it('returns null device when deviceId is unknown', () => {
    const vm = toCycleViewModel({ ...baseCycle, deviceId: 'ghost' }, devicesById, tariffsById);
    expect(vm.device).toBeNull();
    expect(vm.tariff).toBeNull();
  });

  it('sums invoice total and picks the first line currency', () => {
    const cycle: Cycle = {
      ...baseCycle,
      invoiceLines: [
        { name: 'A', totalPrice: 1, currency: 'EUR' },
        { name: 'B', totalPrice: 2.25, currency: 'EUR' },
      ],
    };
    const vm = toCycleViewModel(cycle, devicesById, tariffsById);
    expect(vm.invoiceTotal).toBe(3.25);
    expect(vm.invoiceCurrency).toBe('EUR');
  });

  it('sets invoiceTotal to null when there are no invoice lines', () => {
    const cycle: Cycle = { ...baseCycle, status: 'failure', invoiceLines: [] };
    const vm = toCycleViewModel(cycle, devicesById, tariffsById);
    expect(vm.invoiceTotal).toBeNull();
  });

  it('marks active cycles and computes live duration relative to now', () => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2024-11-25T12:30:00Z'));

    const active: Cycle = { ...baseCycle, status: 'in-progress', stoppedAt: null };
    const vm = toCycleViewModel(active, devicesById, tariffsById);

    expect(vm.isActive).toBe(true);
    expect(vm.durationMs).toBe(30 * 60 * 1000);

    jasmine.clock().uninstall();
  });

  it('returns null duration for cycles without stoppedAt and not active', () => {
    const cycle: Cycle = { ...baseCycle, status: 'cancelled', stoppedAt: null };
    const vm = toCycleViewModel(cycle, devicesById, tariffsById);
    expect(vm.durationMs).toBeNull();
  });
});
