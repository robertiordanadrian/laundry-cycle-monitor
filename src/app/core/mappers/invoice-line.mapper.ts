import { type InvoiceLineDto } from '@core/dto';
import { DEFAULT_CURRENCY, type InvoiceLine, isCurrency } from '@core/models';

export const toInvoiceLine = (dto: InvoiceLineDto): InvoiceLine => ({
  name: String(dto.name ?? ''),
  totalPrice: Number.isFinite(dto.totalPrice) ? Number(dto.totalPrice) : 0,
  currency: isCurrency(dto.currency) ? dto.currency : DEFAULT_CURRENCY,
});
