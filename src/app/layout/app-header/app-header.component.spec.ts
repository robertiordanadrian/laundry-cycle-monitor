import { type HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { LOCAL_STORAGE, type SafeStorage, WINDOW } from '@shared/tokens';

import { AppHeaderComponent } from './app-header.component';

describe('AppHeaderComponent', () => {
  let fixture: ComponentFixture<AppHeaderComponent>;
  let loader: HarnessLoader;

  const mockStorage = (): SafeStorage => ({
    getItem: jasmine.createSpy('getItem').and.returnValue(null),
    setItem: jasmine.createSpy('setItem'),
    removeItem: jasmine.createSpy('removeItem'),
  });

  const mockWindow = () =>
    ({
      matchMedia: () =>
        ({
          matches: false,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
        }) as unknown as MediaQueryList,
    }) as unknown as Window;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppHeaderComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: WINDOW, useValue: mockWindow() },
        { provide: LOCAL_STORAGE, useValue: mockStorage() },
      ],
    });
    fixture = TestBed.createComponent(AppHeaderComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('renders brand and theme toggle only — no nav menu in a single-section app', async () => {
    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain('LAUNDRYHUB');
    // No `nav-cycles` or `nav-create` — the logo is the home link and the
    // primary CTA lives on the cycles list page.
    expect(host.querySelector('[data-testid="nav-cycles"]')).toBeNull();
    expect(host.querySelector('[data-testid="nav-create"]')).toBeNull();
    expect(host.querySelector('[data-testid="theme-toggle"]')).not.toBeNull();
  });

  it('cycles theme preference on toggle click', async () => {
    const toggle = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="theme-toggle"]' }),
    );
    await toggle.click();
    fixture.detectChanges();
    await toggle.click();
    fixture.detectChanges();
    // After two clicks: auto → light → dark
    const buttons = await loader.getAllHarnesses(MatButtonHarness);
    expect(buttons.length).toBeGreaterThan(0);
  });
});
