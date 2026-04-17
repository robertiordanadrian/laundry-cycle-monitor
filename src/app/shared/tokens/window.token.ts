import { InjectionToken } from '@angular/core';

// Injectable `window` — tests provide a stub, SSR-friendly.
export const WINDOW = new InjectionToken<Window>('WINDOW', {
  providedIn: 'root',
  factory: () => {
    if (typeof window === 'undefined') {
      throw new Error('WINDOW is only available in a browser context.');
    }
    return window;
  },
});
