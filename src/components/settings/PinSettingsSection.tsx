import { useState } from 'react';
import { KeyRound, Pencil, Trash2 } from 'lucide-react';
import { PinSetupForm } from './PinSetupForm';

interface PinSettingsSectionProps {
  readonly hasPinConfigured: boolean;
  readonly onSetupPin: (masterPassword: string, newPin: string) => Promise<boolean>;
  readonly onRemovePin: () => void;
  readonly isLoading: boolean;
}

export function PinSettingsSection({
  hasPinConfigured,
  onSetupPin,
  onRemovePin,
  isLoading,
}: PinSettingsSectionProps) {
  const [isSettingUp, setIsSettingUp] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#34c759] text-white shadow-2xs">
            <KeyRound className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-ink">PIN code</span>
            </div>
            <p className="mt-0.5 text-xs text-muted">
              {hasPinConfigured
                ? 'Quick unlock active'
                : 'Quick unlock on this device'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {hasPinConfigured && !isSettingUp && (
            <>
              <button
                type="button"
                onClick={() => setIsSettingUp(true)}
                className="fw-btn fw-btn-ghost fw-btn-sm"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                Change
              </button>
              <button
                type="button"
                onClick={onRemovePin}
                className="fw-btn fw-btn-danger fw-btn-sm"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Remove
              </button>
            </>
          )}

          {!hasPinConfigured && !isSettingUp && (
            <button
              type="button"
              onClick={() => setIsSettingUp(true)}
              className="fw-btn fw-btn-primary fw-btn-sm"
            >
              Configure PIN
            </button>
          )}
        </div>
      </div>

      {isSettingUp && (
        <PinSetupForm
          onSetupPin={onSetupPin}
          onCancel={() => setIsSettingUp(false)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
