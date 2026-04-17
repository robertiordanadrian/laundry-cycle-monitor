// Backend emits tariffId as number on devices, but as string on tariffs.id — normalised in the mapper.
export interface DeviceDto {
  readonly id: string;
  readonly type: string;
  readonly name: string;
  readonly tariffId: number | string;
}
