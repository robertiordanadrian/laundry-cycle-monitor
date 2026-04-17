export const API_ERROR_CATEGORIES = [
  'network',
  'client',
  'server',
  'timeout',
  'parse',
  'unknown',
] as const;

export type ApiErrorCategory = (typeof API_ERROR_CATEGORIES)[number];

export interface ApiError {
  readonly category: ApiErrorCategory;
  readonly status: number;
  readonly message: string;
  readonly url: string | null;
  readonly retryable: boolean;
  readonly at: Date;
  readonly cause?: unknown;
}

export const isApiError = (value: unknown): value is ApiError =>
  typeof value === 'object' &&
  value !== null &&
  'category' in value &&
  'status' in value &&
  'message' in value &&
  'retryable' in value;
