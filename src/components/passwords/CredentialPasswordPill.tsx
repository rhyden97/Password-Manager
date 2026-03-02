import { useState } from 'react';
import { Check, Copy, Eye, EyeOff } from 'lucide-react';
import { IconButton } from '../ui/IconButton';

interface CredentialPasswordPillProps {
  readonly password: string;
  readonly isVisible: boolean;
  readonly onToggleVisibility: () => void;
  readonly onCopy: (text: string, label: string) => void;
}

export function CredentialPasswordPill({
  password,
  isVisible,
  onToggleVisibility,
  onCopy,
}: CredentialPasswordPillProps) {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopyPass = () => {
    onCopy(password, 'Password');
    setHasCopied(true);
    window.setTimeout(() => setHasCopied(false), 1800);
  };

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1 rounded-full border border-hairline/70 bg-surface-subtle px-3 py-1.5 shadow-2xs md:flex-none">
      <span
        className={`min-w-0 flex-1 md:flex-none md:w-32 truncate font-mono text-xs text-ink select-none ${
          isVisible ? 'select-all tracking-normal' : 'tracking-[0.25em]'
        }`}
      >
        {isVisible ? password : '••••••••••••'}
      </span>

      <IconButton
        label={isVisible ? 'Hide password' : 'Show password'}
        size="small"
        className="h-7 w-7 text-muted hover:text-ink"
        onClick={onToggleVisibility}
      >
        {isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </IconButton>

      <button
        type="button"
        aria-label="Copy password"
        title="Copy password"
        onClick={handleCopyPass}
        className={`inline-flex h-7 items-center gap-1 rounded-full px-2 text-xs font-semibold transition-colors ${
          hasCopied
            ? 'bg-success-soft text-success'
            : 'text-muted hover:text-ink hover:bg-surface-muted'
        }`}
      >
        {hasCopied ? (
          <>
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-xs">Copied</span>
          </>
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
