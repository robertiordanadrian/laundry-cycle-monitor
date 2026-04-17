export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

export interface RetryConfig {
  readonly maxAttempts: number;
  readonly initialDelayMs: number;
  readonly backoffFactor: number;
}

export interface AppEnvironment {
  readonly production: boolean;
  readonly apiBaseUrl: string;
  readonly logLevel: LogLevel;
  readonly retry: RetryConfig;
}
