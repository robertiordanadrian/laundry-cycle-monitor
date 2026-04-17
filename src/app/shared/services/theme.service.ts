import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';

import { LOCAL_STORAGE, WINDOW } from '@shared/tokens';

export const THEME_PREFERENCES = ['auto', 'light', 'dark'] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'laundryhub.theme-preference';
const DARK_MEDIA = '(prefers-color-scheme: dark)';

const isThemePreference = (value: unknown): value is ThemePreference =>
  typeof value === 'string' && (THEME_PREFERENCES as readonly string[]).includes(value);

// Cycles auto → light → dark → auto; persists the choice, reflects it on <html data-theme>.
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly window = inject(WINDOW);
  private readonly storage = inject(LOCAL_STORAGE);
  private readonly destroyRef = inject(DestroyRef);

  private readonly mediaQuery = this.window.matchMedia(DARK_MEDIA);

  private readonly _preference = signal<ThemePreference>(this.readInitialPreference());
  private readonly _prefersDark = signal<boolean>(this.mediaQuery.matches);

  readonly preference = this._preference.asReadonly();

  readonly resolved = computed<ThemeMode>(() => {
    const pref = this._preference();
    if (pref === 'auto') {
      return this._prefersDark() ? 'dark' : 'light';
    }
    return pref;
  });

  readonly isDark = computed(() => this.resolved() === 'dark');

  constructor() {
    const mediaHandler = (event: MediaQueryListEvent): void => this._prefersDark.set(event.matches);
    this.mediaQuery.addEventListener('change', mediaHandler);
    this.destroyRef.onDestroy(() => this.mediaQuery.removeEventListener('change', mediaHandler));

    effect(() => {
      const mode = this.resolved();
      this.doc.documentElement.dataset['theme'] = mode;
      this.doc.documentElement.style.colorScheme = mode;
    });
  }

  setPreference(preference: ThemePreference): void {
    this._preference.set(preference);
    this.storage.setItem(STORAGE_KEY, preference);
  }

  cyclePreference(): void {
    const next: Readonly<Record<ThemePreference, ThemePreference>> = {
      auto: 'light',
      light: 'dark',
      dark: 'auto',
    };
    this.setPreference(next[this._preference()]);
  }

  private readInitialPreference(): ThemePreference {
    const stored = this.storage.getItem(STORAGE_KEY);
    return isThemePreference(stored) ? stored : 'auto';
  }
}
