import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusBadgeComponent } from './status-badge.component';
import { StatusBadgeHarness } from './status-badge.harness';

describe('StatusBadgeComponent', () => {
  let fixture: ComponentFixture<StatusBadgeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [StatusBadgeComponent] });
    fixture = TestBed.createComponent(StatusBadgeComponent);
  });

  const buildHarness = async (
    status: 'in-progress' | 'completed' | 'cancelled' | 'failure',
  ): Promise<StatusBadgeHarness> => {
    fixture.componentRef.setInput('status', status);
    fixture.detectChanges();
    return TestbedHarnessEnvironment.harnessForFixture(fixture, StatusBadgeHarness);
  };

  it('renders in-progress with info tone and "In progress" label', async () => {
    const harness = await buildHarness('in-progress');
    expect(await harness.getTone()).toBe('info');
    expect(await harness.getLabel()).toBe('In progress');
    expect(await harness.getStatus()).toBe('in-progress');
  });

  it('renders completed with success tone', async () => {
    const harness = await buildHarness('completed');
    expect(await harness.getTone()).toBe('success');
    expect(await harness.getLabel()).toBe('Completed');
  });

  it('renders cancelled with neutral tone', async () => {
    const harness = await buildHarness('cancelled');
    expect(await harness.getTone()).toBe('neutral');
  });

  it('renders failure with danger tone', async () => {
    const harness = await buildHarness('failure');
    expect(await harness.getTone()).toBe('danger');
  });
});
