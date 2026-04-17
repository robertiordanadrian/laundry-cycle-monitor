import { type HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let fixture: ComponentFixture<EmptyStateComponent>;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
      providers: [provideNoopAnimations()],
    });
    fixture = TestBed.createComponent(EmptyStateComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('renders title and message', () => {
    fixture.componentRef.setInput('title', 'Nothing here');
    fixture.componentRef.setInput('message', 'Please start something.');
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain('Nothing here');
    expect(host.textContent).toContain('Please start something.');
  });

  it('renders CTA button when ctaLabel is provided and emits ctaClick', async () => {
    fixture.componentRef.setInput('title', 'Empty');
    fixture.componentRef.setInput('ctaLabel', 'Do it');
    fixture.detectChanges();

    let emitted = false;
    fixture.componentInstance.ctaClick.subscribe(() => {
      emitted = true;
    });

    const button = await loader.getHarness(MatButtonHarness.with({ text: /Do it/ }));
    await button.click();
    expect(emitted).toBe(true);
  });

  it('hides CTA button when ctaLabel is null', async () => {
    fixture.componentRef.setInput('title', 'Empty');
    fixture.componentRef.setInput('ctaLabel', null);
    fixture.detectChanges();

    const buttons = await loader.getAllHarnesses(MatButtonHarness);
    expect(buttons.length).toBe(0);
  });
});
