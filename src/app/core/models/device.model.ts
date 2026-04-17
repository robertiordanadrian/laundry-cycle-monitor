export const DEVICE_TYPES = ['washer', 'dryer'] as const;

export type DeviceType = (typeof DEVICE_TYPES)[number];

export const isDeviceType = (value: unknown): value is DeviceType =>
  typeof value === 'string' && (DEVICE_TYPES as readonly string[]).includes(value);

export const DEVICE_TYPE_LABEL: Readonly<Record<DeviceType, string>> = Object.freeze({
  washer: 'Washer',
  dryer: 'Dryer',
});

export interface Device {
  readonly id: string;
  readonly type: DeviceType;
  readonly name: string;
  readonly tariffId: string;
}
