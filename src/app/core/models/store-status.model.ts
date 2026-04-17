export const STORE_STATUSES = ['idle', 'loading', 'loaded', 'error'] as const;

export type StoreStatus = (typeof STORE_STATUSES)[number];
