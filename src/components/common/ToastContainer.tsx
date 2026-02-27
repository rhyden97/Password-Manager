import { ToastItem } from '../../types/toast';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface ToastContainerProps {
  readonly toasts: ToastItem[];
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-24 left-4 right-4 z-50 mx-auto flex max-w-sm flex-col gap-2 md:bottom-8 md:left-auto md:right-8 md:w-full md:mx-0"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="fw-toast animate-rise" role="status">
          {toast.type === 'success' && (
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
          )}
          {toast.type === 'error' && (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" aria-hidden="true" />
          )}
          {toast.type === 'info' && (
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" aria-hidden="true" />
          )}
          <span className="min-w-0 wrap-break-word">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
