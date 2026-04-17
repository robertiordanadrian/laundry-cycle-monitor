import { MoneyPipe } from './money.pipe';

describe('MoneyPipe', () => {
  let pipe: MoneyPipe;

  beforeEach(() => {
    pipe = new MoneyPipe();
  });

  it('formats finite number as EUR with 2 fraction digits', () => {
    const result = pipe.transform(3.5, 'EUR', 'en');
    expect(result.replace(/\s/g, '')).toBe('€3.50');
  });

  it('returns em-dash for null/undefined/NaN/Infinity', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform(undefined)).toBe('—');
    expect(pipe.transform(Number.NaN)).toBe('—');
    expect(pipe.transform(Number.POSITIVE_INFINITY)).toBe('—');
  });

  it('caches formatter per locale|currency combo', () => {
    const first = pipe.transform(1.23, 'EUR', 'en');
    const second = pipe.transform(4.56, 'EUR', 'en');
    expect(first.replace(/\s/g, '')).toBe('€1.23');
    expect(second.replace(/\s/g, '')).toBe('€4.56');
  });
});
