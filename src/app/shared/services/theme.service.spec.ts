import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { LOCAL_STORAGE, type SafeStorage, WINDOW } from '@shared/tokens';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let mockStorage: SafeStorage;
  let mediaChangeHandler: ((event: { matches: boolean }) => void) | undefined;
  let matchesValue = false;

  const createMockWindow = (): Window => {
    const list = {
      get matches() {
        return matchesValue;
      },
      addEventListener: (_: string, handler: (event: { matches: boolean }) => void) => {
        mediaChangeHandler = handler;
      },
      removeEventListener: () => {
        mediaChangeHandler = undefined;
      },
    };
    return {
      matchMedia: () => list as unknown as MediaQueryList,
    } as unknown as Window;
  };

  const build = (): ThemeService => {
    mockStorage = {
      getItem: jasmine.createSpy('getItem').and.returnValue(null),
      setItem: jasmine.createSpy('setItem'),
      removeItem: jasmine.createSpy('removeItem'),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: WINDOW, useValue: createMockWindow() },
        { provide: LOCAL_STORAGE, useValue: mockStorage },
        {
          provide: DOCUMENT,
          useValue: { documentElement: { dataset: {}, style: {} } },
        },
      ],
    });
    return TestBed.inject(ThemeService);
  };

  beforeEach(() => {
    matchesValue = false;
    mediaChangeHandler = undefined;
  });

  it('defaults to auto preference and light resolved mode in a light-OS context', () => {
    const service = build();
    expect(service.preference()).toBe('auto');
    expect(service.resolved()).toBe('light');
  });

  it('reacts to OS color-scheme changes when preference is auto', () => {
    const service = build();
    mediaChangeHandler?.({ matches: true });
    expect(service.resolved()).toBe('dark');
    expect(service.isDark()).toBe(true);
  });

  it('cycles auto → light → dark → auto', () => {
    const service = build();
    service.cyclePreference();
    expect(service.preference()).toBe('light');
    service.cyclePreference();
    expect(service.preference()).toBe('dark');
    service.cyclePreference();
    expect(service.preference()).toBe('auto');
  });

  it('persists preference changes to storage', () => {
    const service = build();
    service.setPreference('dark');
    expect(mockStorage.setItem).toHaveBeenCalledWith('laundryhub.theme-preference', 'dark');
  });

  it('reads persisted preference on construction', () => {
    const persistedStorage: SafeStorage = {
      getItem: jasmine.createSpy('getItem').and.returnValue('dark'),
      setItem: jasmine.createSpy('setItem'),
      removeItem: jasmine.createSpy('removeItem'),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: WINDOW, useValue: createMockWindow() },
        { provide: LOCAL_STORAGE, useValue: persistedStorage },
        {
          provide: DOCUMENT,
          useValue: { documentElement: { dataset: {}, style: {} } },
        },
      ],
    });
    const service = TestBed.inject(ThemeService);
    expect(service.preference()).toBe('dark');
    expect(service.resolved()).toBe('dark');
  });
});
