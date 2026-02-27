import type { ReactNode } from 'react';

interface PageHeaderProps {
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
  readonly className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  className = '',
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between ${className}`}
    >
      <div className="min-w-0">
        <h1 className="fw-title">{title}</h1>
        {description && <p className="fw-subtitle mt-2 max-w-2xl">{description}</p>}
      </div>
      {action && <div className="flex w-full shrink-0 gap-2 sm:w-auto">{action}</div>}
    </div>
  );
}
