import { type CycleStatus } from './cycle-status.model';
import { type InvoiceLine } from './invoice-line.model';

export interface Cycle {
  readonly id: string;
  readonly deviceId: string;
  readonly userId: string;
  readonly userAgent: string;
  readonly status: CycleStatus;
  readonly startedAt: Date;
  readonly stoppedAt: Date | null;
  readonly invoiceLines: readonly InvoiceLine[];
}

export interface CreateCycleInput {
  readonly deviceId: string;
  readonly userId: string;
  readonly userAgent: string;
}
