import { Clock, LockKeyhole } from 'lucide-react';
import { AuthShell } from '../auth/AuthShell';
import { PIN_MAX_LENGTH, PIN_MIN_LENGTH } from '../../constants/cryptoConstants';
import { PinDotsDisplay } from './PinDotsDisplay';
import { PinKeypad } from './PinKeypad';
import { usePinUnlock } from '../../hooks/usePinUnlock';

interface PinUnlockViewProps {
  readonly onUnlockWithPin: (pin: string) => Promise<boolean>;
  readonly onSwitchToMasterPassword: () => void;
  readonly onSignOut: () => void;
  readonly isLoading: boolean;
  readonly pinLockedUntil: number;
}

export function PinUnlockView({
  onUnlockWithPin,
  onSwitchToMasterPassword,
  onSignOut,
  isLoading,
  pinLockedUntil,
}: PinUnlockViewProps) {
  const {
    pin,
    setPin,
    inputRef,
    isLocked,
    lockSeconds,
    hasShaken,
    handleSubmit,
    handleKeypadPress,
    handleKeypadBackspace,
    handleClearPin,
  } = usePinUnlock({ onUnlockWithPin, pinLockedUntil, isLoading });

  return (
    <AuthShell
      title="Enter your PIN"
      description="Enter your PIN to unlock your vault."
      hideAside
      footer={
        <div className="flex flex-col items-center gap-2">
          {onSwitchToMasterPassword && (
            <button
              type="button"
              onClick={onSwitchToMasterPassword}
              className="text-xs font-medium text-link hover:underline transition-colors"
            >
              Unlock with master password
            </button>
          )}
          <button
            type="button"
            onClick={onSignOut}
            className="text-xs font-medium text-muted hover:text-ink transition-colors"
          >
            Sign out
          </button>
          <p className="text-center text-xs leading-relaxed text-subtle">
            PIN expires after 30 days and is cleared on sign-out.
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5">
        <input
          ref={inputRef}
          type="password"
          id="pin-unlock"
          inputMode="numeric"
          autoComplete="off"
          minLength={PIN_MIN_LENGTH}
          maxLength={PIN_MAX_LENGTH}
          required
          autoFocus
          disabled={isLocked}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, PIN_MAX_LENGTH))}
          className="sr-only"
          aria-label="Unlock PIN"
        />

        <PinDotsDisplay
          pinLength={pin.length}
          hasShaken={hasShaken}
          onClick={() => inputRef.current?.focus()}
        />

        {isLocked && (
          <div className="fw-status fw-status-danger w-full max-w-60 justify-center py-2 text-xs animate-fade-in">
            <Clock className="h-4 w-4" aria-hidden="true" />
            Too many attempts. Please wait {lockSeconds}s.
          </div>
        )}

        <PinKeypad
          isLocked={isLocked}
          isLoading={isLoading}
          hasDigits={pin.length > 0}
          onKeyPress={handleKeypadPress}
          onBackspace={handleKeypadBackspace}
          onClear={handleClearPin}
        />

        <div className="flex w-full max-w-60 flex-col gap-2 pt-1">
          <button
            type="submit"
            disabled={isLoading || isLocked || pin.length < PIN_MIN_LENGTH}
            className="fw-btn fw-btn-primary fw-btn-block"
          >
            {isLoading ? (
              <>
                <span className="fw-spinner" aria-hidden="true" />
                Verifying PIN...
              </>
            ) : (
              <>
                <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                Unlock with PIN
              </>
            )}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
