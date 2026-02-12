export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  readonly id: number;
  readonly message: string;
  readonly type: ToastType;
}
