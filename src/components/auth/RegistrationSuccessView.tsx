import { Mail } from 'lucide-react';

interface RegistrationSuccessViewProps {
  readonly email: string;
  readonly onGoToLogin: () => void;
}

export function RegistrationSuccessView({ email, onGoToLogin }: RegistrationSuccessViewProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-2 text-center animate-fade-in">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
        <Mail className="h-7 w-7" aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-ink">Check your email</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          We sent a confirmation link to:
        </p>
        <p className="mt-1 break-all text-sm font-semibold text-ink">{email}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Please confirm your email before signing in.
        </p>
      </div>

      <button type="button" onClick={onGoToLogin} className="fw-btn fw-btn-primary fw-btn-block mt-2">
        Proceed to sign in
      </button>
    </div>
  );
}
