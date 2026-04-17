import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { type Cycle, type CycleViewModel, type Device, type Tariff } from '@core/models';

import { CycleDetailDialogComponent } from './cycle-detail-dialog.component';

describe('CycleDetailDialogComponent', () => {
  let fixture: ComponentFixture<CycleDetailDialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<CycleDetailDialogComponent>>;

  const device: Device = { id: '48565', type: 'washer', name: 'Big washer', tariffId: '1' };
  const tariff: Tariff = { id: '1', name: 'Big tariff', price: 3.5, currency: 'EUR' };

  const activeCycle: Cycle = {
    id: 'c-active',
    deviceId: '48565',
    userId: 'nick',
    userAgent: 'iOS; iPhone 12; Version 15.4',
    status: 'in-progress',
    startedAt: new Date('2024-11-28T12:00:00Z'),
    stoppedAt: null,
    invoiceLines: [],
  };

  const buildVm = (overrides: Partial<CycleViewModel> = {}): CycleViewModel => ({
    cycle: activeCycle,
    device,
    tariff,
    invoiceTotal: null,
    invoiceCurrency: null,
    isActive: true,
    durationMs: 30 * 60 * 1000,
    ...overrides,
  });

  const build = (data: CycleViewModel): void => {
    dialogRef = jasmine.createSpyObj<MatDialogRef<CycleDetailDialogComponent>>('MatDialogRef', [
      'close',
    ]);
    TestBed.configureTestingModule({
      imports: [CycleDetailDialogComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    });
    fixture = TestBed.createComponent(CycleDetailDialogComponent);
    fixture.detectChanges();
  };

  afterEach(() => TestBed.resetTestingModule());

  it('renders the device name, tariff and parsed UA chips for an active cycle', () => {
    build(buildVm());
    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain('Big washer');
    expect(host.textContent).toContain('Big tariff');
    const chips = host.querySelectorAll('.cycle-detail__ua-chip');
    const chipText = Array.from(chips).map((el) => el.textContent?.trim());
    expect(chipText).toContain('iOS');
    expect(chipText).toContain('iPhone 12');
  });

  it('renders fallback copy when device and tariff are missing', () => {
    build(
      buildVm({
        device: null,
        tariff: null,
        cycle: { ...activeCycle, userAgent: '' },
      }),
    );
    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain('Device unavailable');
    expect(host.textContent).toContain('Tariff unavailable');
  });

  it('renders completed cycle with invoice table', () => {
    const completed: Cycle = {
      ...activeCycle,
      id: 'c-done',
      status: 'completed',
      stoppedAt: new Date('2024-11-28T13:00:00Z'),
      invoiceLines: [{ name: 'Wash', totalPrice: 3.5, currency: 'EUR' }],
    };
    build(
      buildVm({
        cycle: completed,
        isActive: false,
        invoiceTotal: 3.5,
        invoiceCurrency: 'EUR',
        durationMs: 60 * 60 * 1000,
      }),
    );
    const host: HTMLElement = fixture.nativeElement;
    const table = host.querySelector('.cycle-detail__invoice');
    expect(table).not.toBeNull();
    expect(table?.textContent).toContain('Wash');
  });

  it('closes the dialog when the close button is clicked', () => {
    build(buildVm());
    const closeBtn: HTMLButtonElement | null = fixture.nativeElement.querySelector(
      '[data-testid="cycle-detail-close"]',
    );
    closeBtn?.click();
    expect(dialogRef.close).toHaveBeenCalled();
  });
});
