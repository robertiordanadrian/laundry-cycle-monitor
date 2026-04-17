import { InjectionToken } from '@angular/core';

import { type RetryConfig } from '@env/environment.type';

export const RETRY_CONFIG = new InjectionToken<RetryConfig>('RETRY_CONFIG');
