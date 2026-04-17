import { Pipe, type PipeTransform } from '@angular/core';

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_MINUTE_MS = 60 * 1000;
const ONE_SECOND_MS = 1000;

@Pipe({ name: 'duration', standalone: true, pure: true })
export class DurationPipe implements PipeTransform {
  transform(valueMs: number | null | undefined): string {
    if (valueMs === null || valueMs === undefined || !Number.isFinite(valueMs) || valueMs < 0) {
      return '—';
    }

    const hours = Math.floor(valueMs / ONE_HOUR_MS);
    const minutes = Math.floor((valueMs % ONE_HOUR_MS) / ONE_MINUTE_MS);
    const seconds = Math.floor((valueMs % ONE_MINUTE_MS) / ONE_SECOND_MS);

    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
    }
    return `${seconds}s`;
  }
}
