import { type Currency } from './currency.model';

export interface Tariff {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly currency: Currency;
}
