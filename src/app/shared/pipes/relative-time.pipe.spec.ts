import { RelativeTimePipe } from './relative-time.pipe';

describe('RelativeTimePipe', () => {
  let pipe: RelativeTimePipe;
  const NOW = new Date('2024-12-01T12:00:00Z');

  beforeEach(() => {
    pipe = new RelativeTimePipe();
    jasmine.clock().install();
    jasmine.clock().mockDate(NOW);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('returns "just now" when diff is under 45 seconds', () => {
    const recent = new Date(NOW.getTime() - 30 * 1000);
    expect(pipe.transform(recent)).toBe('just now');
  });

  it('formats minutes ago', () => {
    const fiveMinutesAgo = new Date(NOW.getTime() - 5 * 60 * 1000);
    expect(pipe.transform(fiveMinutesAgo, 'en')).toBe('5 minutes ago');
  });

  it('formats hours ago', () => {
    const twoHoursAgo = new Date(NOW.getTime() - 2 * 60 * 60 * 1000);
    expect(pipe.transform(twoHoursAgo, 'en')).toBe('2 hours ago');
  });

  it('formats "yesterday" (numeric: auto)', () => {
    const yesterday = new Date(NOW.getTime() - 24 * 60 * 60 * 1000);
    expect(pipe.transform(yesterday, 'en')).toBe('yesterday');
  });

  it('returns empty string for null / undefined / invalid', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('not-a-date')).toBe('');
  });

  it('accepts string or number inputs', () => {
    const iso = new Date(NOW.getTime() - 10 * 60 * 1000).toISOString();
    expect(pipe.transform(iso, 'en')).toBe('10 minutes ago');
  });
});
