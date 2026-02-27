import { useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly containerClassName?: string;
  readonly showLabel?: string;
  readonly hideLabel?: string;
}

export function PasswordInput({
  className = '',
  containerClassName = '',
  showLabel = 'Show password',
  hideLabel = 'Hide password',
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const label = isVisible ? hideLabel : showLabel;

  return (
    <div className={`relative ${containerClassName}`}>
      <input
        {...props}
        type={isVisible ? 'text' : 'password'}
        className={`fw-input pr-12 ${className}`}
      />
      <button
        type="button"
        onClick={() => setIsVisible((current) => !current)}
        aria-label={label}
        title={label}
        className="fw-icon-btn fw-icon-btn-sm absolute right-1 top-1/2 -translate-y-1/2"
      >
        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
