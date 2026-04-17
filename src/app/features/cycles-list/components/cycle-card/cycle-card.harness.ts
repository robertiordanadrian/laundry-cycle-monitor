import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

import { type CycleStatus } from '@core/models';
import { StatusBadgeHarness } from '@shared/ui/status-badge';

export interface CycleCardHarnessFilters {
  readonly cycleId?: string;
  readonly status?: CycleStatus;
}

export class CycleCardHarness extends ComponentHarness {
  static readonly hostSelector = 'app-cycle-card';

  static with(filters: CycleCardHarnessFilters = {}): HarnessPredicate<CycleCardHarness> {
    return new HarnessPredicate(CycleCardHarness, {})
      .addOption('cycleId', filters.cycleId, async (harness, cycleId) =>
        (await harness.getCycleId()) === cycleId,
      )
      .addOption('status', filters.status, async (harness, status) =>
        (await harness.getStatus()) === status,
      );
  }

  private readonly getStatusBadge = this.locatorFor(StatusBadgeHarness);
  private readonly getDeviceCell = this.locatorFor('[data-testid="cycle-card-device"]');
  private readonly getTariffCell = this.locatorFor('[data-testid="cycle-card-tariff"]');
  private readonly getInvoiceCell = this.locatorFor('[data-testid="cycle-card-invoice"]');
  private readonly getDurationCell = this.locatorFor('[data-testid="cycle-card-duration"]');

  async getCycleId(): Promise<string | null> {
    return (await this.host()).getAttribute('data-cycle-id');
  }

  async getStatus(): Promise<CycleStatus> {
    return (await this.getStatusBadge()).getStatus();
  }

  async getDeviceText(): Promise<string> {
    return (await (await this.getDeviceCell()).text()).trim();
  }

  async getTariffText(): Promise<string> {
    return (await (await this.getTariffCell()).text()).trim();
  }

  async getInvoiceText(): Promise<string> {
    return (await (await this.getInvoiceCell()).text()).trim();
  }

  async getDurationText(): Promise<string> {
    return (await (await this.getDurationCell()).text()).trim();
  }
}
