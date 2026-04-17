import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Observable, map } from 'rxjs';

import { type DeviceDto } from '@core/dto';
import { toDevice } from '@core/mappers';
import { type Device } from '@core/models';
import { API_BASE_URL } from '@core/tokens';

@Injectable({ providedIn: 'root' })
export class DevicesApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(): Observable<readonly Device[]> {
    return this.http
      .get<readonly DeviceDto[]>(`${this.baseUrl}/devices`)
      .pipe(map((dtos) => dtos.map(toDevice)));
  }
}
