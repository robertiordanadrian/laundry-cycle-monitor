import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { type Cycle, type CycleViewModel, type Device, type Tariff } from '@core/models';

import { CycleCardComponent } from './cycle-card.component';
import { CycleCardHarness } from './cycle-card.harness';

describe('CycleCardComponent', () => {
  let fixture: ComponentFixture<CycleCardComponent>;

  const device: Device = { id: '48565', type: 'washer', name: 'Big washer', tariffId: '1' };
  const tariff: Tariff = { id: '1', name: 'Big tariff', price: 3.5, currency: 'EUR' };

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

  const buildVm = (overrides: Partial<CycleViewModel> = {}): CycleViewModel => ({
    cycle: baseCycle,
    device,
    tariff,
    invoiceTotal: 3.5,
    invoiceCurrency: 'EUR',
    isActive: false,
    durationMs: 60 * 60 * 1000,
    ...overrides,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CycleCardComponent] });
    fixture = TestBed.createComponent(CycleCardComponent);
  });

  const getCardHarness = (vm: CycleViewModel): Promise<CycleCardHarness> => {
    fixture.componentRef.setInput('viewModel', vm);
    fixture.detectChanges();
    return TestbedHarnessEnvironment.harnessForFixture(fixture, CycleCardHarness);
  };

  it('renders status, device name, tariff and invoice via harness', async () => {
    const card = await getCardHarness(buildVm());
    expect(await card.getCycleId()).toBe('c1');
    expect(await card.getStatus()).toBe('completed');
    expect(await card.getDeviceText()).toContain('Big washer');
    expect(await card.getTariffText()).toContain('Big tariff');
    expect(await card.getInvoiceText()).toContain('3.50');
  });

  it('shows fallback text when device is missing', async () => {
    const card = await getCardHarness(buildVm({ device: null, tariff: null }));
    expect(await card.getDeviceText()).toContain('Device unavailable');
    expect(await card.getTariffText()).toContain('Tariff unavailable');
  });

  it('shows "No invoice yet" when invoiceTotal is null', async () => {
    const card = await getCardHarness(buildVm({ invoiceTotal: null, invoiceCurrency: null }));
    expect(await card.getInvoiceText()).toContain('No invoice yet');
  });

  it('flags temp ids with the optimistic class', () => {
    const optimistic: CycleViewModel = buildVm({
      cycle: { ...baseCycle, id: 'temp-xyz' },
    });
    fixture.componentRef.setInput('viewModel', optimistic);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.classList.contains('cycle-card--optimistic')).toBe(true);
  });
});
