import { type TariffDto } from '@core/dto';
import { DEFAULT_CURRENCY, isCurrency, type Tariff } from '@core/models';

export const toTariff = (dto: TariffDto): Tariff => ({
  id: String(dto.id),
  name: String(dto.name ?? ''),
  price: Number.isFinite(dto.price) ? Number(dto.price) : 0,
  currency: isCurrency(dto.currency) ? dto.currency : DEFAULT_CURRENCY,
});
