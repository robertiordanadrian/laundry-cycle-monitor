import { toInvoiceLine } from './invoice-line.mapper';

describe('toInvoiceLine', () => {
  it('maps DTO to domain preserving currency when supported', () => {
    const line = toInvoiceLine({ name: 'Washing cycle', totalPrice: 2.5, currency: 'EUR' });
    expect(line).toEqual({ name: 'Washing cycle', totalPrice: 2.5, currency: 'EUR' });
  });

  it('falls back to EUR when currency is unsupported', () => {
    const line = toInvoiceLine({ name: 'X', totalPrice: 1, currency: 'ZZZ' });
    expect(line.currency).toBe('EUR');
  });

  it('coerces non-finite price to 0', () => {
    const line = toInvoiceLine({ name: 'X', totalPrice: Number.NaN, currency: 'EUR' });
    expect(line.totalPrice).toBe(0);
  });

  it('coerces missing name to empty string', () => {
    const line = toInvoiceLine({ name: null as unknown as string, totalPrice: 1, currency: 'EUR' });
    expect(line.name).toBe('');
  });
});
