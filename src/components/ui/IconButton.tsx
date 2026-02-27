import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  readonly label: string;
  readonly tone?: 'default' | 'danger';
  readonly onDark?: boolean;
  readonly size?: 'default' | 'small';
  readonly children: ReactNode;
}

export function IconButton({
  label,
  tone = 'default',
  onDark = false,
  size = 'default',
  className = '',
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={[
        'fw-icon-btn',
        tone === 'danger' ? 'fw-icon-btn-danger' : '',
        onDark ? 'fw-icon-btn-on-dark' : '',
        size === 'small' ? 'fw-icon-btn-sm' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
