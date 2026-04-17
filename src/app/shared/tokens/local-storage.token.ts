import { InjectionToken } from '@angular/core';

export interface SafeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const createInMemoryStorage = (): SafeStorage => {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
  };
};

// Falls back to in-memory map when the browser blocks localStorage (private mode, quota).
export const LOCAL_STORAGE = new InjectionToken<SafeStorage>('LOCAL_STORAGE', {
  providedIn: 'root',
  factory: () => {
    try {
      const probeKey = '__laundryhub_probe__';
      window.localStorage.setItem(probeKey, probeKey);
      window.localStorage.removeItem(probeKey);
      return window.localStorage;
    } catch {
      return createInMemoryStorage();
    }
  },
});
