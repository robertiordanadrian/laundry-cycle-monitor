import {
  type Cycle,
  type CycleViewModel,
  DEFAULT_CURRENCY,
  type Device,
  type Tariff,
} from '@core/models';

export const toCycleViewModel = (
  cycle: Cycle,
  devicesById: ReadonlyMap<string, Device>,
  tariffsById: ReadonlyMap<string, Tariff>,
): CycleViewModel => {
  const device = devicesById.get(cycle.deviceId) ?? null;
  const tariff = device ? (tariffsById.get(device.tariffId) ?? null) : null;
  const isActive = cycle.status === 'in-progress';

  const invoiceTotal =
    cycle.invoiceLines.length > 0
      ? cycle.invoiceLines.reduce((sum, line) => sum + line.totalPrice, 0)
      : null;

  const invoiceCurrency =
    cycle.invoiceLines[0]?.currency ?? tariff?.currency ?? DEFAULT_CURRENCY;

  const endReference = cycle.stoppedAt ?? (isActive ? new Date() : null);
  const durationMs = endReference ? endReference.getTime() - cycle.startedAt.getTime() : null;

  return {
    cycle,
    device,
    tariff,
    invoiceTotal,
    invoiceCurrency: invoiceTotal === null && !isActive ? null : invoiceCurrency,
    isActive,
    durationMs,
  };
};
