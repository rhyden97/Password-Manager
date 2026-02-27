import type { ReactNode } from 'react';

interface EmptyStateProps {
  readonly icon: ReactNode;
  readonly title: string;
  readonly description: string;
  readonly action?: ReactNode;
  readonly className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`fw-card flex flex-col items-center gap-3 px-6 py-14 text-center ${className}`}>
      <div className="fw-icon-tile fw-icon-tile-lg text-muted">{icon}</div>
      <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
      <p className="max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
