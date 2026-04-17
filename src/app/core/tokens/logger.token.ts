import { InjectionToken } from '@angular/core';

import { type LogLevel } from '@env/environment.type';

export interface Logger {
  debug(message: string, ...args: readonly unknown[]): void;
  info(message: string, ...args: readonly unknown[]): void;
  warn(message: string, ...args: readonly unknown[]): void;
  error(message: string, ...args: readonly unknown[]): void;
}

export const LOGGER = new InjectionToken<Logger>('LOGGER');

const LEVEL_WEIGHT: Readonly<Record<LogLevel, number>> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
};

/* eslint-disable no-console */
export class ConsoleLogger implements Logger {
  private readonly threshold: number;

  constructor(level: LogLevel) {
    this.threshold = LEVEL_WEIGHT[level];
  }

  debug(message: string, ...args: readonly unknown[]): void {
    if (this.threshold <= LEVEL_WEIGHT.debug) {
      console.debug(message, ...args);
    }
  }

  info(message: string, ...args: readonly unknown[]): void {
    if (this.threshold <= LEVEL_WEIGHT.info) {
      console.info(message, ...args);
    }
  }

  warn(message: string, ...args: readonly unknown[]): void {
    if (this.threshold <= LEVEL_WEIGHT.warn) {
      console.warn(message, ...args);
    }
  }

  error(message: string, ...args: readonly unknown[]): void {
    if (this.threshold <= LEVEL_WEIGHT.error) {
      console.error(message, ...args);
    }
  }
}
/* eslint-enable no-console */

export class SilentLogger implements Logger {
  debug(_message: string, ..._args: readonly unknown[]): void {
    /* no-op */
  }
  info(_message: string, ..._args: readonly unknown[]): void {
    /* no-op */
  }
  warn(_message: string, ..._args: readonly unknown[]): void {
    /* no-op */
  }
  error(_message: string, ..._args: readonly unknown[]): void {
    /* no-op */
  }
}
