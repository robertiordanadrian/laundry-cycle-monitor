import { type AppEnvironment } from './environment.type';

export const environment: AppEnvironment = {
  production: false,
  apiBaseUrl: '/api',
  logLevel: 'debug',
  retry: {
    maxAttempts: 3,
    initialDelayMs: 1000,
    backoffFactor: 2,
  },
};
