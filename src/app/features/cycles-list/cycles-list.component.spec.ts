import { type HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatTabGroupHarness } from '@angular/material/tabs/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { API_BASE_URL, LOGGER, SilentLogger } from '@core/tokens';
import { CycleCardHarness } from '@features/cycles-list/components/cycle-card';

import { CyclesListComponent } from './cycles-list.component';

describe('CyclesListComponent', () => {
  let fixture: ComponentFixture<CyclesListComponent>;
  let loader: HarnessLoader;
  let controller: HttpTestingController;

  const FIXTURES = {
    cycles: [
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
    ],
    devices: [
      { id: '48565', type: 'washer', name: 'Big washing machine', tariffId: 1 },
      { id: '48567', type: 'washer', name: 'Small washing machine', tariffId: 2 },
    ],
    tariffs: [
      { id: '1', name: 'Big tariff', price: 3.5, currency: 'EUR' },
      { id: '2', name: 'Small tariff', price: 2.5, currency: 'EUR' },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CyclesListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations(),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: LOGGER, useValue: new SilentLogger() },
      ],
    });
    fixture = TestBed.createComponent(CyclesListComponent);
    controller = TestBed.inject(HttpTestingController);
    loader = TestbedHarnessEnvironment.loader(fixture);

    fixture.detectChanges();
    controller.expectOne('/api/cycles').flush(FIXTURES.cycles);
    controller.expectOne('/api/devices').flush(FIXTURES.devices);
    controller.expectOne('/api/tariffs').flush(FIXTURES.tariffs);
    fixture.detectChanges();
  });

  afterEach(() => controller.verify());

  it('renders Active and History tabs via MatTabGroupHarness', async () => {
    const tabs = await loader.getHarness(MatTabGroupHarness);
    const labels = (await tabs.getTabs()).map((tab) => tab.getLabel());
    const resolved = await Promise.all(labels);
    expect(resolved).toEqual(['Active', 'History']);
  });

  it('shows the in-progress cycle under Active tab', async () => {
    const cards = await loader.getAllHarnesses(CycleCardHarness.with({ status: 'in-progress' }));
    expect(cards.length).toBe(1);
    expect(await cards[0]!.getCycleId()).toBe('active-1');
  });

  it('shows past cycles under History tab after switching', async () => {
    const tabs = await loader.getHarness(MatTabGroupHarness);
    await tabs.selectTab({ label: 'History' });
    fixture.detectChanges();
    await fixture.whenStable();

    const cards = await loader.getAllHarnesses(CycleCardHarness.with({ status: 'completed' }));
    expect(cards.length).toBe(1);
    expect(await cards[0]!.getCycleId()).toBe('done-1');
  });

  it('reloads all three stores when Refresh is pressed', async () => {
    const refreshBtn = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="cycles-list-refresh"]' }),
    );
    await refreshBtn.click();
    fixture.detectChanges();

    const cycles = controller.expectOne('/api/cycles');
    const devices = controller.expectOne('/api/devices');
    const tariffs = controller.expectOne('/api/tariffs');
    expect(cycles.request.method).toBe('GET');
    expect(devices.request.method).toBe('GET');
    expect(tariffs.request.method).toBe('GET');
    cycles.flush([]);
    devices.flush([]);
    tariffs.flush([]);
  });
});
