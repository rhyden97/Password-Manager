import { useState, useCallback } from 'react';
import { ToastItem, ToastType } from '../types/toast';

const DEFAULT_TOAST_DURATION_MS = 3500;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = Date.now() + Math.random();
      setToasts((previous) => [...previous, { id, message, type }]);

      window.setTimeout(() => {
        removeToast(id);
      }, DEFAULT_TOAST_DURATION_MS);
    },
    [removeToast]
  );

  return { toasts, showToast, removeToast };
}
