import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { AuthShell } from '../auth/AuthShell';
import { PasswordInput } from '../ui/PasswordInput';

interface VaultUnlockViewProps {
  readonly onUnlock: (password: string) => Promise<boolean>;
  readonly hasPinConfigured: boolean;
  readonly onSwitchToPin: () => void;
  readonly onSignOut: () => void;
  readonly isLoading: boolean;
}

export function VaultUnlockView({
  onUnlock,
  hasPinConfigured,
  onSwitchToPin,
  onSignOut,
  isLoading,
}: VaultUnlockViewProps) {
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password) return;
    await onUnlock(password);
  };

  return (
    <AuthShell
      title="Unlock your vault"
      description="Enter your master password to unlock your vault."
      footer={
        <div className="flex flex-col items-center gap-2">
          <button type="button" onClick={onSignOut} className="fw-link text-xs">
            Sign out
          </button>
          <p className="text-center text-xs leading-relaxed text-subtle">
            Your master password cannot be recovered.
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="fw-label" htmlFor="unlock-pass">
            Master password
          </label>
          <PasswordInput
            id="unlock-pass"
            required
            autoFocus
            autoComplete="current-password"
            placeholder="Your master password"
            containerClassName="mt-1.5"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button type="submit" disabled={isLoading} className="fw-btn fw-btn-primary fw-btn-block">
          {isLoading ? (
            <>
              <span className="fw-spinner" aria-hidden="true" />
              Decrypting...
            </>
          ) : (
            'Unlock vault'
          )}
        </button>

        {hasPinConfigured && (
          <button
            type="button"
            onClick={onSwitchToPin}
            className="fw-btn fw-btn-ghost fw-btn-block"
          >
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            Unlock with PIN
          </button>
        )}
      </form>
    </AuthShell>
  );
}
