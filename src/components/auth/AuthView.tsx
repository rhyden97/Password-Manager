import { AuthShell } from './AuthShell';
import { PasswordInput } from '../ui/PasswordInput';

interface AuthViewProps {
  readonly email: string;
  readonly onChangeEmail: (email: string) => void;
  readonly password: string;
  readonly onChangePassword: (password: string) => void;
  readonly isRegistering: boolean;
  readonly onToggleRegistering: (isRegistering: boolean) => void;
  readonly rememberCreds: boolean;
  readonly onToggleRememberCreds: (remember: boolean) => void;
  readonly isLoading: boolean;
  readonly onSubmit: () => Promise<boolean>;
}

export function AuthView({
  email,
  onChangeEmail,
  password,
  onChangePassword,
  isRegistering,
  onToggleRegistering,
  rememberCreds,
  onToggleRememberCreds,
  isLoading,
  onSubmit,
}: AuthViewProps) {
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit();
  };

  return (
    <AuthShell
      title={isRegistering ? 'Create account' : 'Sign in'}
      description={
        isRegistering
          ? 'Sign up to get started.'
          : 'Sign in to access your vault.'
      }
      footer={
        <div className="flex flex-col gap-2 text-center">
          <button
            type="button"
            onClick={() => onToggleRegistering(!isRegistering)}
            className="fw-link text-sm"
          >
            {isRegistering
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="fw-label" htmlFor="auth-email">
            Email address
          </label>
          <input
            type="email"
            id="auth-email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="fw-input mt-1.5"
            value={email}
            onChange={(event) => onChangeEmail(event.target.value)}
          />
        </div>

        <div>
          <label className="fw-label" htmlFor="auth-password">
            Account password
          </label>
          <PasswordInput
            id="auth-password"
            required
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
            placeholder="Your password"
            containerClassName="mt-1.5"
            value={password}
            onChange={(event) => onChangePassword(event.target.value)}
          />
        </div>

        {!isRegistering && (
          <label className="flex items-center gap-2.5 text-sm text-muted">
            <input
              type="checkbox"
              checked={rememberCreds}
              onChange={(event) => onToggleRememberCreds(event.target.checked)}
              className="fw-checkbox"
            />
            Remember email on this device
          </label>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="fw-btn fw-btn-primary fw-btn-block mt-1"
        >
          {isLoading ? (
            <>
              <span className="fw-spinner" aria-hidden="true" />
              Processing...
            </>
          ) : isRegistering ? (
            'Create account'
          ) : (
            'Sign in'
          )}
        </button>
      </form>
    </AuthShell>
  );
}
