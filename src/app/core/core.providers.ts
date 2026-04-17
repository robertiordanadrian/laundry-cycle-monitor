import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { environment } from '@env/environment';

import { errorInterceptor, loggingInterceptor } from './interceptors';
import {
  API_BASE_URL,
  CURRENT_USER,
  ConsoleLogger,
  type CurrentUser,
  LOGGER,
  RETRY_CONFIG,
} from './tokens';

export const provideCore = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    provideHttpClient(withFetch(), withInterceptors([loggingInterceptor, errorInterceptor])),
    { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
    { provide: RETRY_CONFIG, useValue: environment.retry },
    { provide: LOGGER, useValue: new ConsoleLogger(environment.logLevel) },
    {
      provide: CURRENT_USER,
      useFactory: (): CurrentUser => ({
        userId: 'web-user',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      }),
    },
  ]);
