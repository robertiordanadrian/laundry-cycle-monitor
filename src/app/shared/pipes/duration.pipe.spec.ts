import { DurationPipe } from './duration.pipe';

describe('DurationPipe', () => {
  let pipe: DurationPipe;

  beforeEach(() => {
    pipe = new DurationPipe();
  });

  it('formats hours and minutes with zero-padded minutes', () => {
    const oneHourTwoMinutes = (60 + 2) * 60 * 1000;
    expect(pipe.transform(oneHourTwoMinutes)).toBe('1h 02m');
  });

  it('formats minutes and seconds when under an hour', () => {
    const fiveMinutesThirtyFiveSeconds = 5 * 60 * 1000 + 35 * 1000;
    expect(pipe.transform(fiveMinutesThirtyFiveSeconds)).toBe('5m 35s');
  });

  it('formats seconds when under a minute', () => {
    expect(pipe.transform(12 * 1000)).toBe('12s');
  });

  it('returns em-dash for invalid / negative input', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform(undefined)).toBe('—');
    expect(pipe.transform(-1)).toBe('—');
    expect(pipe.transform(Number.NaN)).toBe('—');
  });
});
