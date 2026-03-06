import { AlertTriangle } from 'lucide-react';

interface DangerZoneSectionProps {
  readonly onResetVault: () => Promise<boolean>;
}

export function DangerZoneSection({ onResetVault }: DangerZoneSectionProps) {
  const handleConfirmReset = async () => {
    const isConfirmed = window.confirm(
      'Are you sure you want to permanently delete your vault? All your passwords and encrypted data will be irreversibly erased.'
    );
    if (isConfirmed) await onResetVault();
  };

  return (
    <div>
      <h3 className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted">
        Danger Zone
      </h3>
      <section className="flex justify-between rounded-2xl border border-hairline bg-surface p-4 shadow-2xs sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#ff3b30] text-white shadow-2xs">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <span className="text-sm font-medium text-danger">Delete entire vault</span>
            <p className="mt-0.5 text-xs text-muted">
              Permanently erases all your passwords and encrypted secrets
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleConfirmReset}
          className="fw-btn fw-btn-danger fw-btn-sm self-start sm:self-auto"
        >
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
          Delete vault
        </button>
      </section>
      <p className="px-3 pt-2 text-xs leading-relaxed text-muted">
        This action cannot be undone. All secrets will be permanently purged.
      </p>
    </div>
  );
}
