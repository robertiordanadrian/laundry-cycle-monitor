import { Pipe, type PipeTransform } from '@angular/core';

import { MESSAGES } from '@shared/i18n';

const UNIT_STEPS: readonly (readonly [Intl.RelativeTimeFormatUnit, number])[] = [
  ['year', 60 * 60 * 24 * 365],
  ['month', 60 * 60 * 24 * 30],
  ['week', 60 * 60 * 24 * 7],
  ['day', 60 * 60 * 24],
  ['hour', 60 * 60],
  ['minute', 60],
  ['second', 1],
];

const formatterByLocale = new Map<string, Intl.RelativeTimeFormat>();

const getFormatter = (locale: string): Intl.RelativeTimeFormat => {
  let formatter = formatterByLocale.get(locale);
  if (!formatter) {
    formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'long' });
    formatterByLocale.set(locale, formatter);
  }
  return formatter;
};

// Pure — won't self-tick. For live "x minutes ago", the container must push a new Date.
@Pipe({ name: 'relativeTime', standalone: true, pure: true })
export class RelativeTimePipe implements PipeTransform {
  transform(value: Date | string | number | null | undefined, locale = 'en'): string {
    if (value === null || value === undefined) {
      return '';
    }
    const date = value instanceof Date ? value : new Date(value);
    const ms = date.getTime();
    if (!Number.isFinite(ms)) {
      return '';
    }

    const diffSeconds = Math.round((ms - Date.now()) / 1000);
    if (Math.abs(diffSeconds) < 45) {
      return MESSAGES.relativeTime.now;
    }

    const formatter = getFormatter(locale);
    for (const [unit, unitSeconds] of UNIT_STEPS) {
      if (Math.abs(diffSeconds) >= unitSeconds) {
        const amount = Math.round(diffSeconds / unitSeconds);
        return formatter.format(amount, unit);
      }
    }
    return formatter.format(diffSeconds, 'second');
  }
}
