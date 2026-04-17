import { toTariff } from './tariff.mapper';

describe('toTariff', () => {
  it('maps DTO to domain with string id', () => {
    const tariff = toTariff({ id: '1', name: 'Big washing', price: 3.5, currency: 'EUR' });
    expect(tariff).toEqual({ id: '1', name: 'Big washing', price: 3.5, currency: 'EUR' });
  });

  it('coerces numeric id to string', () => {
    const tariff = toTariff({ id: 2 as unknown as string, name: 'N', price: 1, currency: 'EUR' });
    expect(tariff.id).toBe('2');
  });

  it('falls back to EUR for unsupported currency', () => {
    const tariff = toTariff({ id: '1', name: 'N', price: 1, currency: 'USD' });
    expect(tariff.currency).toBe('EUR');
  });

  it('coerces non-finite price to 0', () => {
    const tariff = toTariff({
      id: '1',
      name: 'N',
      price: Number.POSITIVE_INFINITY,
      currency: 'EUR',
    });
    expect(tariff.price).toBe(0);
  });

  it('falls back to empty string when name is missing', () => {
    const tariff = toTariff({
      id: '1',
      name: undefined as unknown as string,
      price: 1,
      currency: 'EUR',
    });
    expect(tariff.name).toBe('');
  });
});
