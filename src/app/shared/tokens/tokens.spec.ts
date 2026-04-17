import { TestBed } from '@angular/core/testing';

import { LOCAL_STORAGE, type SafeStorage } from './local-storage.token';
import { WINDOW } from './window.token';

describe('WINDOW token', () => {
  it('resolves to the real browser window in a Karma context', () => {
    const win = TestBed.inject(WINDOW);
    expect(win).toBe(window);
  });
});

describe('LOCAL_STORAGE token', () => {
  it('returns the browser localStorage when the probe succeeds', () => {
    const storage = TestBed.inject(LOCAL_STORAGE);
    expect(storage).toBe(window.localStorage);
  });

  it('falls back to an in-memory map when localStorage.setItem throws', () => {
    const original = Object.getOwnPropertyDescriptor(Storage.prototype, 'setItem');

    Object.defineProperty(Storage.prototype, 'setItem', {
      configurable: true,
      value: () => {
        throw new Error('blocked');
      },
    });

    try {
      TestBed.resetTestingModule();
      const fallback: SafeStorage = TestBed.inject(LOCAL_STORAGE);
      expect(fallback).not.toBe(window.localStorage);

      fallback.setItem('a', '1');
      expect(fallback.getItem('a')).toBe('1');
      fallback.removeItem('a');
      expect(fallback.getItem('a')).toBeNull();
      expect(fallback.getItem('missing')).toBeNull();
    } finally {
      if (original) {
        Object.defineProperty(Storage.prototype, 'setItem', original);
      }
    }
  });
});
