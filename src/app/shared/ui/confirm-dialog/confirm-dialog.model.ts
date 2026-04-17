export type ConfirmTone = 'neutral' | 'danger';

export interface ConfirmDialogInput {
  readonly title: string;
  readonly message: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly tone?: ConfirmTone;
}
