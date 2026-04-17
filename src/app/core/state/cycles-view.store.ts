import { Injectable, computed, inject } from '@angular/core';

import { toCycleViewModel } from '@core/mappers';
import { type CycleViewModel, type Device, type Tariff } from '@core/models';

import { CyclesStore } from './cycles.store';
import { DevicesStore } from './devices.store';
import { TariffsStore } from './tariffs.store';

// Join cycle ⊕ device ⊕ tariff lives in one computed(); components don't join in templates.
@Injectable({ providedIn: 'root' })
export class CyclesViewStore {
  private readonly cyclesStore = inject(CyclesStore);
  private readonly devicesStore = inject(DevicesStore);
  private readonly tariffsStore = inject(TariffsStore);

  readonly viewModels = computed<readonly CycleViewModel[]>(() => {
    const cycles = this.cyclesStore.cycles();
    const devicesById = this.devicesStore.devicesById();
    const tariffsById = this.tariffsStore.tariffsById();
    return cycles.map((cycle) => toCycleViewModel(cycle, devicesById, tariffsById));
  });

  readonly activeViewModels = computed<readonly CycleViewModel[]>(() =>
    [...this.viewModels()]
      .filter((vm) => vm.isActive)
      .sort((a, b) => b.cycle.startedAt.getTime() - a.cycle.startedAt.getTime()),
  );

  readonly pastViewModels = computed<readonly CycleViewModel[]>(() =>
    [...this.viewModels()]
      .filter((vm) => !vm.isActive)
      .sort((a, b) => b.cycle.startedAt.getTime() - a.cycle.startedAt.getTime()),
  );

  readonly availableDevices = computed<readonly Device[]>(() => {
    const activeDeviceIds = new Set(this.cyclesStore.activeCycles().map((c) => c.deviceId));
    return this.devicesStore.devices().filter((device) => !activeDeviceIds.has(device.id));
  });

  readonly tariffByDeviceId = computed<ReadonlyMap<string, Tariff>>(() => {
    const result = new Map<string, Tariff>();
    const tariffsById = this.tariffsStore.tariffsById();
    for (const device of this.devicesStore.devices()) {
      const tariff = tariffsById.get(device.tariffId);
      if (tariff) {
        result.set(device.id, tariff);
      }
    }
    return result;
  });

  readonly anyLoading = computed(
    () =>
      this.cyclesStore.loading() || this.devicesStore.loading() || this.tariffsStore.loading(),
  );

  readonly anyLoaded = computed(
    () => this.cyclesStore.loaded() && this.devicesStore.loaded() && this.tariffsStore.loaded(),
  );

  loadAll(): void {
    this.cyclesStore.load();
    this.devicesStore.load();
    this.tariffsStore.load();
  }
}
