import { type HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { type ApiError } from '@core/models';

import { ErrorBoundaryComponent } from './error-boundary.component';

describe('ErrorBoundaryComponent', () => {
  let fixture: ComponentFixture<ErrorBoundaryComponent>;
  let loader: HarnessLoader;

  const buildError = (overrides: Partial<ApiError> = {}): ApiError => ({
    category: 'server',
    status: 503,
    message: 'Service unavailable',
    url: '/api/cycles',
    retryable: true,
    at: new Date(),
    ...overrides,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ErrorBoundaryComponent],
      providers: [provideNoopAnimations()],
    });
    fixture = TestBed.createComponent(ErrorBoundaryComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('shows the error message and category', () => {
    fixture.componentRef.setInput('error', buildError());
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain('Service unavailable');
    expect(host.textContent).toContain('server');
  });

  it('shows retry button only when the error is retryable', async () => {
    fixture.componentRef.setInput('error', buildError({ retryable: true }));
    fixture.detectChanges();

    let retryButtons = await loader.getAllHarnesses(MatButtonHarness);
    expect(retryButtons.length).toBe(1);

    fixture.componentRef.setInput('error', buildError({ retryable: false }));
    fixture.detectChanges();

    retryButtons = await loader.getAllHarnesses(MatButtonHarness);
    expect(retryButtons.length).toBe(0);
  });

  it('emits retry event on button click', async () => {
    fixture.componentRef.setInput('error', buildError());
    fixture.detectChanges();

    let emitted = false;
    fixture.componentInstance.retry.subscribe(() => {
      emitted = true;
    });

    const button = await loader.getHarness(MatButtonHarness);
    await button.click();
    expect(emitted).toBe(true);
  });
});
