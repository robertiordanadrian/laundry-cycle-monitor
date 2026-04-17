import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Observable, map } from 'rxjs';

import { type CycleDto } from '@core/dto';
import { toCreateCycleDto, toCycle } from '@core/mappers';
import { type CreateCycleInput, type Cycle } from '@core/models';
import { API_BASE_URL } from '@core/tokens';

@Injectable({ providedIn: 'root' })
export class CyclesApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(): Observable<readonly Cycle[]> {
    return this.http
      .get<readonly CycleDto[]>(`${this.baseUrl}/cycles`)
      .pipe(map((dtos) => dtos.map(toCycle)));
  }

  create(input: CreateCycleInput, now: Date = new Date()): Observable<Cycle> {
    return this.http
      .post<CycleDto>(`${this.baseUrl}/cycles`, toCreateCycleDto(input, now))
      .pipe(map(toCycle));
  }
}
