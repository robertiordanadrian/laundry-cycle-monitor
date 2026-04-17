import { type InvoiceLineDto } from './invoice-line.dto';

// `status` is `string`, not the domain union — we validate on the mapper boundary.
export interface CycleDto {
  readonly id: string;
  readonly deviceId: string;
  readonly userId: string;
  readonly userAgent: string;
  readonly status: string;
  readonly startedAt: string;
  readonly stoppedAt: string | null;
  readonly invoiceLines: readonly InvoiceLineDto[] | null;
}

// `id` is omitted — json-server assigns it server-side.
export interface CycleCreateDto {
  readonly deviceId: string;
  readonly userId: string;
  readonly userAgent: string;
  readonly status: 'in-progress';
  readonly startedAt: string;
  readonly stoppedAt: null;
  readonly invoiceLines: readonly [];
}
