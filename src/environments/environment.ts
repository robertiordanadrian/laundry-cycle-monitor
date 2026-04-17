import { type AppEnvironment } from './environment.type';

export const environment: AppEnvironment = {
  production: true,
  apiBaseUrl: '/api',
  logLevel: 'error',
  retry: {
    maxAttempts: 3,
    initialDelayMs: 1000,
    backoffFactor: 2,
  },
};
