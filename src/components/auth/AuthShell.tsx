import type { ReactNode } from 'react';
import { CloudOff, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

interface AuthShellProps {
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly hideAside?: boolean;
}

export function AuthShell({
  title,
  description,
  children,
  footer,
  hideAside = false,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-canvas px-4 py-4 md:px-8 md:py-8 flex flex-col justify-center">
      <div
        className={
          hideAside
            ? 'mx-auto w-full max-w-90'
            : 'mx-auto w-full max-w-5xl md:grid md:min-h-145 md:grid-cols-[1.1fr_0.9fr] md:items-stretch md:gap-6'
        }
      >
        {!hideAside && (
          <aside className="fw-tile hidden md:flex flex-col justify-between p-8 lg:p-10">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <ShieldCheck className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <span className="text-sm font-semibold tracking-wider text-white">FORTRESS</span>
            </div>

            <div className="my-auto py-8">
              <h2 className="max-w-md text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-white lg:text-4xl">
                Your secrets, strictly yours.
              </h2>
              <p className="mt-3.5 max-w-sm text-sm leading-relaxed text-white/70">
                Passwords, API keys, and 2FA backup codes encrypted directly in your browser with AES-256-GCM.
                The database never sees your plaintext secrets.
              </p>
            </div>

            <div className="grid gap-3 border-t border-white/10 pt-6 text-xs text-white/75">
              <div className="flex items-center gap-2.5">
                <LockKeyhole className="h-4 w-4 text-white/60" aria-hidden="true" />
                <span>Local AES-256-GCM encryption</span>
              </div>
              <div className="flex items-center gap-2.5">
                <KeyRound className="h-4 w-4 text-white/60" aria-hidden="true" />
                <span>PBKDF2 key derivation (600k iterations)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CloudOff className="h-4 w-4 text-white/60" aria-hidden="true" />
                <span>Client-side end-to-end encryption</span>
              </div>
            </div>
          </aside>
        )}

        {!hideAside && (
          <div className="mb-4 flex items-center justify-between md:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-tile text-white">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="text-sm font-semibold tracking-wider text-ink">FORTRESS</span>
            </div>
            <ThemeToggle />
          </div>
        )}

        {hideAside && (
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-tile text-white">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="text-sm font-semibold tracking-wider text-ink">FORTRESS</span>
            </div>
            <ThemeToggle />
          </div>
        )}

        <main className="flex items-center justify-center w-full">
          <section className={`fw-card w-full ${hideAside ? 'max-w-90 p-6' : 'max-w-md p-6 sm:p-8'}`}>
            <div className={`mb-6 ${hideAside ? 'text-center' : 'flex items-start justify-between gap-4'}`}>
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-[-0.03em] text-ink sm:text-3xl mt-2">
                  {title}
                </h1>
                {description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
                )}
              </div>
              {!hideAside && (
                <div>
                  <ThemeToggle />
                </div>
              )}
            </div>

            {children}

            {footer && <div className="mt-6 border-t border-hairline pt-4">{footer}</div>}
          </section>
        </main>
      </div>
    </div>
  );
}
