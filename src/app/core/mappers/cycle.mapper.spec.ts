import { type CycleDto } from '@core/dto';

import { toCreateCycleDto, toCycle } from './cycle.mapper';

describe('toCycle', () => {
  const baseDto: CycleDto = {
    id: '1',
    deviceId: '48565',
    userId: 'alex',
    userAgent: 'Mozilla/5.0',
    status: 'completed',
    startedAt: '2024-11-25T12:01:24.329Z',
    stoppedAt: '2024-11-25T13:01:24.329Z',
    invoiceLines: [{ name: 'Wash', totalPrice: 2.5, currency: 'EUR' }],
  };

  it('parses dates to Date instances', () => {
    const cycle = toCycle(baseDto);
    expect(cycle.startedAt).toBeInstanceOf(Date);
    expect(cycle.startedAt.toISOString()).toBe('2024-11-25T12:01:24.329Z');
    expect(cycle.stoppedAt?.toISOString()).toBe('2024-11-25T13:01:24.329Z');
  });

  it('leaves stoppedAt null when not set', () => {
    const cycle = toCycle({ ...baseDto, stoppedAt: null });
    expect(cycle.stoppedAt).toBeNull();
  });

  it('normalizes empty/null invoiceLines to empty array', () => {
    expect(toCycle({ ...baseDto, invoiceLines: null }).invoiceLines).toEqual([]);
    expect(toCycle({ ...baseDto, invoiceLines: [] }).invoiceLines).toEqual([]);
  });

  it('keeps terminal statuses unchanged', () => {
    for (const status of ['completed', 'cancelled', 'failure'] as const) {
      expect(toCycle({ ...baseDto, status }).status).toBe(status);
    }
  });

  it('keeps "in-progress" when stoppedAt is null (consistent wire data)', () => {
    const cycle = toCycle({ ...baseDto, status: 'in-progress', stoppedAt: null });
    expect(cycle.status).toBe('in-progress');
  });

  it('coerces "in-progress" + stoppedAt set + invoice lines → "completed"', () => {
    const cycle = toCycle({
      ...baseDto,
      status: 'in-progress',
      stoppedAt: '2024-11-25T13:01:24.329Z',
      invoiceLines: [{ name: 'Wash', totalPrice: 2.5, currency: 'EUR' }],
    });
    expect(cycle.status).toBe('completed');
    expect(cycle.stoppedAt).not.toBeNull();
  });

  it('coerces "in-progress" + stoppedAt set + no invoice → "cancelled"', () => {
    const cycle = toCycle({
      ...baseDto,
      status: 'in-progress',
      stoppedAt: '2024-11-28T13:01:24.329Z',
      invoiceLines: [],
    });
    expect(cycle.status).toBe('cancelled');
  });

  it('falls back to "failure" for unknown status', () => {
    expect(toCycle({ ...baseDto, status: 'mystery' }).status).toBe('failure');
  });

  it('returns a safe epoch startedAt when backend emits a garbage date', () => {
    const cycle = toCycle({ ...baseDto, startedAt: 'not-a-date' });
    expect(cycle.startedAt.getTime()).toBe(0);
  });

  it('coerces id fields to string', () => {
    const cycle = toCycle({ ...baseDto, id: 42 as unknown as string, deviceId: 7 as unknown as string });
    expect(cycle.id).toBe('42');
    expect(cycle.deviceId).toBe('7');
  });

  it('treats empty/undefined stoppedAt strings as null', () => {
    expect(toCycle({ ...baseDto, stoppedAt: '' }).stoppedAt).toBeNull();
    expect(toCycle({ ...baseDto, stoppedAt: undefined as unknown as null }).stoppedAt).toBeNull();
  });

  it('falls back to empty strings when userId/userAgent are missing', () => {
    const cycle = toCycle({
      ...baseDto,
      userId: undefined as unknown as string,
      userAgent: undefined as unknown as string,
    });
    expect(cycle.userId).toBe('');
    expect(cycle.userAgent).toBe('');
  });
});

describe('toCreateCycleDto', () => {
  it('builds an in-progress cycle with empty invoice lines', () => {
    const now = new Date('2024-12-01T10:00:00Z');
    const dto = toCreateCycleDto(
      { deviceId: '48565', userId: 'web-user', userAgent: 'ua' },
      now,
    );
    expect(dto).toEqual({
      deviceId: '48565',
      userId: 'web-user',
      userAgent: 'ua',
      status: 'in-progress',
      startedAt: '2024-12-01T10:00:00.000Z',
      stoppedAt: null,
      invoiceLines: [],
    });
  });
});
