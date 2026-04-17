export const CYCLE_STATUSES = ['in-progress', 'completed', 'cancelled', 'failure'] as const;

export type CycleStatus = (typeof CYCLE_STATUSES)[number];

export const isCycleStatus = (value: unknown): value is CycleStatus =>
  typeof value === 'string' && (CYCLE_STATUSES as readonly string[]).includes(value);

export const CYCLE_STATUS_LABEL: Readonly<Record<CycleStatus, string>> = Object.freeze({
  'in-progress': 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  failure: 'Failure',
});

export const CYCLE_STATUS_TONE: Readonly<Record<CycleStatus, 'info' | 'success' | 'neutral' | 'danger'>> =
  Object.freeze({
    'in-progress': 'info',
    completed: 'success',
    cancelled: 'neutral',
    failure: 'danger',
  });
