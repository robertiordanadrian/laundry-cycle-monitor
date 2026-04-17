import { type HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { type ApiError, type CycleViewModel } from '@core/models';
import { CycleCardHarness } from '@features/cycles-list/components/cycle-card';

import { CyclesSectionComponent } from './cycles-section.component';

describe('CyclesSectionComponent', () => {
  let fixture: ComponentFixture<CyclesSectionComponent>;
  let loader: HarnessLoader;

  const buildVm = (id: string, status: 'in-progress' | 'completed'): CycleViewModel => ({
    cycle: {
      id,
      deviceId: '1',
      userId: 'u',
      userAgent: '',
      status,
      startedAt: new Date('2024-11-25T12:00:00Z'),
      stoppedAt: status === 'completed' ? new Date('2024-11-25T13:00:00Z') : null,
      invoiceLines: [],
    },
    device: { id: '1', type: 'washer', name: 'Washer', tariffId: '1' },
    tariff: { id: '1', name: 'Tariff', price: 3.5, currency: 'EUR' },
    invoiceTotal: status === 'completed' ? 3.5 : null,
    invoiceCurrency: 'EUR',
    isActive: status === 'in-progress',
    durationMs: 3600000,
  });

  const apiError = (): ApiError => ({
    category: 'server',
    status: 500,
    message: 'Boom',
    url: '/api/cycles',
    retryable: true,
    at: new Date(),
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CyclesSectionComponent],
      providers: [provideNoopAnimations()],
    });
    fixture = TestBed.createComponent(CyclesSectionComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.componentRef.setInput('emptyTitle', 'No cycles');
  });

  it('renders an error boundary when error is set', async () => {
    fixture.componentRef.setInput('items', []);
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('error', apiError());
    fixture.detectChanges();

    const buttons = await loader.getAllHarnesses(MatButtonHarness);
    expect(buttons.length).toBe(1);

    let retried = false;
    fixture.componentInstance.retry.subscribe(() => {
      retried = true;
    });
    await buttons[0]!.click();
    expect(retried).toBe(true);
  });

  it('renders skeleton when loading with no items', () => {
    fixture.componentRef.setInput('items', []);
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('error', null);
    fixture.detectChanges();

    const skeleton = fixture.nativeElement.querySelector('app-skeleton-list');
    expect(skeleton).not.toBeNull();
  });

  it('renders empty state when loaded with no items', async () => {
    fixture.componentRef.setInput('items', []);
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('error', null);
    fixture.componentRef.setInput('emptyCtaLabel', 'Start');
    fixture.detectChanges();

    const emptyStateEl = fixture.nativeElement.querySelector('app-empty-state');
    expect(emptyStateEl).not.toBeNull();
  });

  it('renders cycle cards when items are present', async () => {
    fixture.componentRef.setInput('items', [buildVm('c1', 'in-progress'), buildVm('c2', 'completed')]);
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();

    const cards = await loader.getAllHarnesses(CycleCardHarness);
    expect(cards.length).toBe(2);
  });
});
