import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useModalA11y } from '../../hooks/useModalA11y';

interface ModalShellProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly titleId: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly children: ReactNode;
  readonly maxWidthClassName?: string;
}

export function ModalShell({
  isOpen,
  onClose,
  titleId,
  title,
  subtitle,
  children,
  maxWidthClassName = '',
}: ModalShellProps) {
  const containerRef = useModalA11y(isOpen, onClose);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fw-modal-overlay p-0 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={`fw-modal ${maxWidthClassName}`}>
        <div className="pt-2.5 pb-1 sm:hidden flex justify-center">
          <div className="h-1 w-9 rounded-full bg-muted/30" />
        </div>

        <div className="flex items-center justify-between gap-3 border-b border-hairline px-5 py-3.5 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base sm:text-lg font-semibold tracking-[-0.02em] text-ink truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-muted truncate mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-subtle text-muted hover:bg-surface-muted hover:text-ink active:scale-95 transition-all shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}
