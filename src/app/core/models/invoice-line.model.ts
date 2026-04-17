import { type Currency } from './currency.model';

export interface InvoiceLine {
  readonly name: string;
  readonly totalPrice: number;
  readonly currency: Currency;
}
