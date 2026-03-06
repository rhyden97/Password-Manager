import { AlertTriangle, RefreshCw } from 'lucide-react';
import { AuthShell } from '../auth/AuthShell';

interface VaultErrorViewProps {
  readonly message: string;
  readonly onRetry: () => void;
  readonly onSignOut: () => void;
}

export function VaultErrorView({ message, onRetry, onSignOut }: VaultErrorViewProps) {
  return (
    <AuthShell
      title="Unable to load vault"
      description="An error occurred while loading your vault. Please try again."
      footer={
        <div className="flex justify-center">
          <button type="button" onClick={onSignOut} className="fw-link text-xs">
            Sign out
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="fw-status fw-status-danger w-full items-start justify-start px-3.5 py-3 text-left text-xs leading-relaxed">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="break-words">{message}</span>
        </div>

        <button type="button" onClick={onRetry} className="fw-btn fw-btn-primary fw-btn-block">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Retry
        </button>
      </div>
    </AuthShell>
  );
}
