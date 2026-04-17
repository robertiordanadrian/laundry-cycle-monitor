import { type DeviceDto } from '@core/dto';
import { type Device, type DeviceType, isDeviceType } from '@core/models';

// Normalises `tariffId` to string so it matches `Tariff.id` in Map lookups.
export const toDevice = (dto: DeviceDto): Device => {
  const type: DeviceType = isDeviceType(dto.type) ? dto.type : 'washer';
  return {
    id: String(dto.id),
    type,
    name: String(dto.name ?? ''),
    tariffId: String(dto.tariffId),
  };
};
