import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { AuthShell } from '../auth/AuthShell';
import { PasswordInput } from '../ui/PasswordInput';
import { generatePassword } from '../../hooks/usePasswordGenerator';
import { MASTER_PASSWORD_MIN_LENGTH } from '../../constants/cryptoConstants';

interface VaultSetupViewProps {
  readonly onSetupVault: (password: string) => Promise<boolean>;
  readonly onSignOut: () => void;
  readonly isLoading: boolean;
}

export function VaultSetupView({ onSetupVault, onSignOut, isLoading }: VaultSetupViewProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleGenerate = () => {
    const generated = generatePassword({
      length: 20,
      hasUpper: true,
      hasLower: true,
      hasNumbers: true,
      hasSymbols: true,
    });
    setPassword(generated);
    setConfirmPassword(generated);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    if (password.length < MASTER_PASSWORD_MIN_LENGTH) {
      setErrorMessage(`Master password must be at least ${MASTER_PASSWORD_MIN_LENGTH} characters long`);
      return;
    }
    setErrorMessage('');
    await onSetupVault(password);
  };

  return (
    <AuthShell
      title="Create your master password"
      description="This password encrypts your vault. It cannot be recovered if lost."
      footer={
        <div className="flex flex-col items-center gap-2">
          <button type="button" onClick={onSignOut} className="fw-link text-xs">
            Sign out
          </button>
          <p className="text-center text-xs leading-relaxed text-subtle">
            Keep your master password in a safe place.
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <div className="flex items-center justify-between gap-3">
            <label className="fw-label" htmlFor="setup-pass">
              Master password
            </label>
            <button
              type="button"
              onClick={handleGenerate}
              className="fw-link flex items-center gap-1 text-xs"
            >
              <RefreshCw className="h-3 w-3" aria-hidden="true" />
              Generate
            </button>
          </div>
          <PasswordInput
            id="setup-pass"
            required
            autoComplete="new-password"
            minLength={MASTER_PASSWORD_MIN_LENGTH}
            placeholder={`At least ${MASTER_PASSWORD_MIN_LENGTH} characters`}
            containerClassName="mt-1.5"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <div>
          <label className="fw-label" htmlFor="setup-confirm">
            Confirm master password
          </label>
          <PasswordInput
            id="setup-confirm"
            required
            autoComplete="new-password"
            minLength={MASTER_PASSWORD_MIN_LENGTH}
            placeholder="Repeat master password"
            containerClassName="mt-1.5"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>

        {errorMessage && <p className="text-xs font-medium text-danger">{errorMessage}</p>}

        <button type="submit" disabled={isLoading} className="fw-btn fw-btn-primary fw-btn-block">
          {isLoading ? (
            <>
              <span className="fw-spinner" aria-hidden="true" />
              Creating vault...
            </>
          ) : (
            'Create encrypted vault'
          )}
        </button>
      </form>
    </AuthShell>
  );
}
