import { type Currency } from './currency.model';
import { type Cycle } from './cycle.model';
import { type Device } from './device.model';
import { type Tariff } from './tariff.model';

// device/tariff can be null when the wire references a missing record.
export interface CycleViewModel {
  readonly cycle: Cycle;
  readonly device: Device | null;
  readonly tariff: Tariff | null;
  readonly invoiceTotal: number | null;
  readonly invoiceCurrency: Currency | null;
  readonly isActive: boolean;
  readonly durationMs: number | null;
}
