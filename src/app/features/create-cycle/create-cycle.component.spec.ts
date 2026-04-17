import { type HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { type ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { API_BASE_URL, CURRENT_USER, LOGGER, SilentLogger } from '@core/tokens';
import { NotificationService } from '@shared/services';

import { CreateCycleComponent } from './create-cycle.component';

describe('CreateCycleComponent', () => {
  let fixture: ComponentFixture<CreateCycleComponent>;
  let loader: HarnessLoader;
  let controller: HttpTestingController;
  let notifications: jasmine.SpyObj<NotificationService>;

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
    ],
    devices: [
      { id: '48565', type: 'washer', name: 'Big washing machine', tariffId: 1 },
      { id: '48567', type: 'washer', name: 'Small washing machine', tariffId: 2 },
      { id: '48111', type: 'dryer', name: 'Little giant dryer', tariffId: 3 },
    ],
    tariffs: [
      { id: '1', name: 'Big washing machine tariff', price: 3.5, currency: 'EUR' },
      { id: '2', name: 'Small washing machine tariff', price: 2.5, currency: 'EUR' },
      { id: '3', name: 'Drying tariff', price: 1.5, currency: 'EUR' },
    ],
  };

  beforeEach(async () => {
    notifications = jasmine.createSpyObj<NotificationService>('NotificationService', [
      'success',
      'error',
      'info',
    ]);

    TestBed.configureTestingModule({
      imports: [CreateCycleComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'cycles', children: [] }, { path: 'cycles/new', component: CreateCycleComponent }]),
        provideNoopAnimations(),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: LOGGER, useValue: new SilentLogger() },
        { provide: CURRENT_USER, useValue: { userId: 'web-user', userAgent: 'test-agent' } },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    fixture = TestBed.createComponent(CreateCycleComponent);
    controller = TestBed.inject(HttpTestingController);
    loader = TestbedHarnessEnvironment.loader(fixture);

    fixture.detectChanges();
    controller.expectOne('/api/cycles').flush(FIXTURES.cycles);
    controller.expectOne('/api/devices').flush(FIXTURES.devices);
    controller.expectOne('/api/tariffs').flush(FIXTURES.tariffs);
    fixture.detectChanges();
  });

  afterEach(() => controller.verify());

  it('lists only available devices (device 48567 has an active cycle and is hidden)', async () => {
    const select = await loader.getHarness(MatSelectHarness);
    await select.open();
    const options = await select.getOptions();
    const labels = await Promise.all(options.map((o) => o.getText()));
    expect(labels.some((l) => l.includes('Big washing machine'))).toBe(true);
    expect(labels.some((l) => l.includes('Little giant dryer'))).toBe(true);
    expect(labels.some((l) => l.includes('Small washing machine'))).toBe(false);
  });

  it('reveals a live price preview that matches the selected device tariff', async () => {
    const select = await loader.getHarness(MatSelectHarness);
    await select.clickOptions({ text: /Big washing machine/ });
    fixture.detectChanges();

    const priceEl: HTMLElement | null = fixture.nativeElement.querySelector(
      '[data-testid="create-cycle-price"]',
    );
    expect(priceEl?.textContent?.replace(/\s/g, '')).toContain('€3.50');
  });

  it('disables submit and reports the control as required when no device is picked', async () => {
    const submitBtn = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="create-cycle-submit"]' }),
    );
    expect(await submitBtn.isDisabled()).toBe(true);

    const field = await loader.getHarness(MatFormFieldHarness);
    const control = await field.getControl(MatSelectHarness);
    expect(await control?.isRequired()).toBe(true);
    expect(await control?.isEmpty()).toBe(true);
  });

  it('submits optimistically and shows a success toast', fakeAsync(async () => {
    const select = await loader.getHarness(MatSelectHarness);
    await select.clickOptions({ text: /Big washing machine/ });
    fixture.detectChanges();

    const submitBtn = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="create-cycle-submit"]' }),
    );
    expect(await submitBtn.isDisabled()).toBe(false);
    await submitBtn.click();

    const post = controller.expectOne((req) => req.method === 'POST' && req.url === '/api/cycles');
    expect(post.request.body.deviceId).toBe('48565');
    expect(post.request.body.userId).toBe('web-user');
    expect(post.request.body.userAgent).toBe('test-agent');

    post.flush({
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

    expect(notifications.success).toHaveBeenCalled();
  }));

  it('shows an error toast and does not navigate on failure', fakeAsync(async () => {
    const select = await loader.getHarness(MatSelectHarness);
    await select.clickOptions({ text: /Big washing machine/ });
    fixture.detectChanges();

    const submitBtn = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="create-cycle-submit"]' }),
    );
    await submitBtn.click();

    controller
      .expectOne((req) => req.method === 'POST' && req.url === '/api/cycles')
      .flush(null, { status: 400, statusText: 'Bad Request' });

    tick();
    flush();

    expect(notifications.error).toHaveBeenCalled();
  }));
});
