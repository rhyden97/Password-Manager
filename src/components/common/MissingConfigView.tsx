import { AlertTriangle, RefreshCw, Terminal } from 'lucide-react';
import { AuthShell } from '../auth/AuthShell';

export function MissingConfigView() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <AuthShell
      title="Connect your vault"
      description="Fortress requires your Supabase project credentials to synchronize the encrypted vault."
      footer={
        <p className="text-center text-xs leading-relaxed text-subtle">
          Check the README for the database schema SQL and RLS policies.
        </p>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="fw-status fw-status-danger w-full items-start justify-start px-3.5 py-3 text-left text-xs leading-relaxed">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Missing environment variables in local .env file.</span>
        </div>

        <div className="fw-inset flex flex-col gap-3 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink">
            <Terminal className="h-4 w-4 text-primary" aria-hidden="true" />
            Quick setup step
          </div>

          <pre className="fw-mono select-all overflow-x-auto rounded-lg bg-surface-muted p-3 text-xs text-ink">
            cp .env.example .env
          </pre>

          <p className="text-xs leading-relaxed text-muted">
            Open the <span className="font-mono text-ink">.env</span> file and set{' '}
            <span className="font-mono text-ink">VITE_SUPABASE_URL</span> and{' '}
            <span className="font-mono text-ink">VITE_SUPABASE_ANON_KEY</span> from your Supabase
            dashboard.
          </p>
        </div>

        <button type="button" onClick={handleReload} className="fw-btn fw-btn-primary fw-btn-block">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Retry connection
        </button>
      </div>
    </AuthShell>
  );
}
