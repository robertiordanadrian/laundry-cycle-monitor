import { InjectionToken } from '@angular/core';

export interface CurrentUser {
  readonly userId: string;
  readonly userAgent: string;
}

export const CURRENT_USER = new InjectionToken<CurrentUser>('CURRENT_USER');
