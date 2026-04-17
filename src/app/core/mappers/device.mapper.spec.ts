import { toDevice } from './device.mapper';

describe('toDevice', () => {
  it('normalizes numeric tariffId from backend quirk to string', () => {
    const device = toDevice({
      id: '48565',
      type: 'washer',
      name: 'Big washing machine',
      tariffId: 1,
    });
    expect(device.tariffId).toBe('1');
    expect(typeof device.tariffId).toBe('string');
  });

  it('keeps tariffId as string when already a string', () => {
    const device = toDevice({
      id: '48111',
      type: 'dryer',
      name: 'Little giant dryer',
      tariffId: '3',
    });
    expect(device.tariffId).toBe('3');
  });

  it('maps valid device types', () => {
    expect(toDevice({ id: '1', type: 'washer', name: 'n', tariffId: 1 }).type).toBe('washer');
    expect(toDevice({ id: '1', type: 'dryer', name: 'n', tariffId: 1 }).type).toBe('dryer');
  });

  it('falls back to washer for unknown device type', () => {
    const device = toDevice({ id: '1', type: 'microwave', name: 'n', tariffId: 1 });
    expect(device.type).toBe('washer');
  });

  it('falls back to empty string when name is missing', () => {
    const device = toDevice({
      id: '1',
      type: 'washer',
      name: undefined as unknown as string,
      tariffId: 1,
    });
    expect(device.name).toBe('');
  });
});
