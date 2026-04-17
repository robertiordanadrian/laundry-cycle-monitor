import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Observable, map } from 'rxjs';

import { type TariffDto } from '@core/dto';
import { toTariff } from '@core/mappers';
import { type Tariff } from '@core/models';
import { API_BASE_URL } from '@core/tokens';

@Injectable({ providedIn: 'root' })
export class TariffsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(): Observable<readonly Tariff[]> {
    return this.http
      .get<readonly TariffDto[]>(`${this.baseUrl}/tariffs`)
      .pipe(map((dtos) => dtos.map(toTariff)));
  }
}
