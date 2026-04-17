import { type CycleCreateDto, type CycleDto } from '@core/dto';
import {
  type CreateCycleInput,
  type Cycle,
  type CycleStatus,
  type InvoiceLine,
  isCycleStatus,
} from '@core/models';

import { toInvoiceLine } from './invoice-line.mapper';

const parseDate = (value: string | null | undefined): Date | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const parseStartDate = (value: string): Date => {
  const parsed = parseDate(value);
  return parsed ?? new Date(0);
};

const fallbackStatus: CycleStatus = 'failure';

// Fixture contains cycles with status='in-progress' AND a stoppedAt timestamp
// (see README §Assumptions). Coerce to a terminal status so the rest of the
// app can assume `status === 'in-progress'` ⇒ `stoppedAt === null`.
const reconcileStatus = (
  rawStatus: CycleStatus,
  stoppedAt: Date | null,
  invoiceLines: readonly InvoiceLine[],
): CycleStatus => {
  if (rawStatus === 'in-progress' && stoppedAt !== null) {
    return invoiceLines.length > 0 ? 'completed' : 'cancelled';
  }
  return rawStatus;
};

export const toCycle = (dto: CycleDto): Cycle => {
  const stoppedAt = parseDate(dto.stoppedAt);
  const invoiceLines: readonly InvoiceLine[] = Array.isArray(dto.invoiceLines)
    ? dto.invoiceLines.map(toInvoiceLine)
    : [];
  const rawStatus: CycleStatus = isCycleStatus(dto.status) ? dto.status : fallbackStatus;

  return {
    id: String(dto.id),
    deviceId: String(dto.deviceId),
    userId: String(dto.userId ?? ''),
    userAgent: String(dto.userAgent ?? ''),
    status: reconcileStatus(rawStatus, stoppedAt, invoiceLines),
    startedAt: parseStartDate(dto.startedAt),
    stoppedAt,
    invoiceLines,
  };
};

export const toCreateCycleDto = (
  input: CreateCycleInput,
  now: Date = new Date(),
): CycleCreateDto => ({
  deviceId: input.deviceId,
  userId: input.userId,
  userAgent: input.userAgent,
  status: 'in-progress',
  startedAt: now.toISOString(),
  stoppedAt: null,
  invoiceLines: [],
});
