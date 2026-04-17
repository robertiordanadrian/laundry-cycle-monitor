import { type HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { API_BASE_URL, CURRENT_USER, LOGGER, SilentLogger } from '@core/tokens';
import { CreateCycleComponent } from '@features/create-cycle';
import { CyclesListComponent } from '@features/cycles-list';
import { CycleCardHarness } from '@features/cycles-list/components/cycle-card';
import { NotificationService } from '@shared/services';

/**
 * End-to-end flow exercised against the mock HTTP layer:
 *  1. /cycles loads, shows active + history
 *  2. user navigates to /cycles/new
 *  3. selects a device, submits
 *  4. POST succeeds → navigate back to /cycles
 *  5. new cycle is visible in the Active tab (optimistic insert reconciled)
 */
describe('Cycles flow (integration)', () => {
  let http: HttpTestingController;
  let harness: RouterTestingHarness;
  let notifications: jasmine.SpyObj<NotificationService>;

  const cyclesFixture = [
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
  ];
  const devicesFixture = [
    { id: '48565', type: 'washer', name: 'Big washing machine', tariffId: 1 },
    { id: '48567', type: 'washer', name: 'Small washing machine', tariffId: 2 },
  ];
  const tariffsFixture = [
    { id: '1', name: 'Big tariff', price: 3.5, currency: 'EUR' },
    { id: '2', name: 'Small tariff', price: 2.5, currency: 'EUR' },
  ];

  beforeEach(async () => {
    notifications = jasmine.createSpyObj<NotificationService>('NotificationService', [
      'success',
      'error',
      'info',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: '', pathMatch: 'full', redirectTo: 'cycles' },
          { path: 'cycles', component: CyclesListComponent },
          { path: 'cycles/new', component: CreateCycleComponent },
        ]),
        provideNoopAnimations(),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: LOGGER, useValue: new SilentLogger() },
        { provide: CURRENT_USER, useValue: { userId: 'web-user', userAgent: 'test-agent' } },
        { provide: NotificationService, useValue: notifications },
      ],
    });

    http = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => http.verify());

  const flushAllResources = () => {
    http.expectOne('/api/cycles').flush(cyclesFixture);
    http.expectOne('/api/devices').flush(devicesFixture);
    http.expectOne('/api/tariffs').flush(tariffsFixture);
  };

  it('navigates from list → new → submits → new cycle appears in list', fakeAsync(async () => {
    // 1. Load /cycles
    await harness.navigateByUrl('/cycles');
    flushAllResources();
    harness.detectChanges();

    let loader: HarnessLoader = TestbedHarnessEnvironment.loader(harness.fixture);
    let activeCards = await loader.getAllHarnesses(
      CycleCardHarness.with({ status: 'in-progress' }),
    );
    expect(activeCards.length).toBe(1);

    // 2. Navigate to /cycles/new
    await harness.navigateByUrl('/cycles/new');
    harness.detectChanges();
    loader = TestbedHarnessEnvironment.loader(harness.fixture);

    // 3. Select available device and submit
    const select = await loader.getHarness(MatSelectHarness);
    await select.clickOptions({ text: /Big washing machine/ });
    harness.detectChanges();

    const submitBtn = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="create-cycle-submit"]' }),
    );
    await submitBtn.click();

    // 4. POST succeeds, persisted id assigned
    http.expectOne((req) => req.method === 'POST' && req.url === '/api/cycles').flush({
      id: '99',
      deviceId: '48565',
      userId: 'web-user',
      userAgent: 'test-agent',
      status: 'in-progress',
      startedAt: new Date().toISOString(),
      stoppedAt: null,
      invoiceLines: [],
    });
    tick();
    flush();
    harness.detectChanges();

    expect(notifications.success).toHaveBeenCalled();

    // 5. Back on /cycles list — the new cycle is present from the store
    loader = TestbedHarnessEnvironment.loader(harness.fixture);
    activeCards = await loader.getAllHarnesses(CycleCardHarness.with({ status: 'in-progress' }));
    const ids = await Promise.all(activeCards.map((c) => c.getCycleId()));
    expect(ids).toContain('99');
  }));
});
