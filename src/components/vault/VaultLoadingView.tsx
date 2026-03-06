import { ShieldCheck } from 'lucide-react';

interface VaultLoadingViewProps {
  readonly message?: string;
}

export function VaultLoadingView({ message = 'Synchronizing vault...' }: VaultLoadingViewProps) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-5 bg-canvas px-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tile text-on-tile">
        <ShieldCheck className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="fw-spinner text-primary" aria-hidden="true" />
        <p className="text-sm font-medium text-muted">{message}</p>
      </div>
    </div>
  );
}
