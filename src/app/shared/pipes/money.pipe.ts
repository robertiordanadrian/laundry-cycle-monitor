import { Pipe, type PipeTransform } from '@angular/core';

import { type Currency, DEFAULT_CURRENCY } from '@core/models';

const formatterCache = new Map<string, Intl.NumberFormat>();

const getFormatter = (locale: string, currency: Currency): Intl.NumberFormat => {
  const key = `${locale}|${currency}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    formatterCache.set(key, formatter);
  }
  return formatter;
};

@Pipe({ name: 'money', standalone: true, pure: true })
export class MoneyPipe implements PipeTransform {
  transform(
    value: number | null | undefined,
    currency: Currency = DEFAULT_CURRENCY,
    locale = 'en',
  ): string {
    if (value === null || value === undefined || !Number.isFinite(value)) {
      return '—';
    }
    return getFormatter(locale, currency).format(value);
  }
}
