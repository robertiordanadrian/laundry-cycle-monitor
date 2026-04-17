import { ComponentHarness } from '@angular/cdk/testing';

import { type CycleStatus } from '@core/models';

export class StatusBadgeHarness extends ComponentHarness {
  static readonly hostSelector = 'app-status-badge';

  async getStatus(): Promise<CycleStatus> {
    const host = await this.host();
    const value = await host.getAttribute('data-status');
    return value as CycleStatus;
  }

  async getTone(): Promise<'info' | 'success' | 'neutral' | 'danger'> {
    const host = await this.host();
    const value = await host.getAttribute('data-tone');
    return value as 'info' | 'success' | 'neutral' | 'danger';
  }

  async getLabel(): Promise<string> {
    const host = await this.host();
    return (await host.text()).trim();
  }
}
