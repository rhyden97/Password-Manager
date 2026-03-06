import { useState } from 'react';
import { PIN_MAX_LENGTH, PIN_MIN_LENGTH } from '../../constants/cryptoConstants';
import { PasswordInput } from '../ui/PasswordInput';

interface PinSetupFormProps {
  readonly onSetupPin: (masterPassword: string, newPin: string) => Promise<boolean>;
  readonly onCancel: () => void;
  readonly isLoading: boolean;
}

const PIN_PATTERN = new RegExp(`^\\d{${PIN_MIN_LENGTH},${PIN_MAX_LENGTH}}$`);

export function PinSetupForm({ onSetupPin, onCancel, isLoading }: PinSetupFormProps) {
  const [masterPassword, setMasterPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!PIN_PATTERN.test(newPin)) {
      setErrorMessage(`PIN must be between ${PIN_MIN_LENGTH} and ${PIN_MAX_LENGTH} digits`);
      return;
    }
    if (newPin !== confirmPin) {
      setErrorMessage('PINs do not match');
      return;
    }
    if (!masterPassword) {
      setErrorMessage('Enter your master password to confirm');
      return;
    }
    setErrorMessage('');
    const success = await onSetupPin(masterPassword, newPin);
    if (success) {
      onCancel();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2 flex flex-col gap-3 rounded-xl border border-hairline bg-surface-subtle/50 p-4"
    >
      <div>
        <label className="fw-label" htmlFor="pin-master-password">
          Master password
        </label>
        <PasswordInput
          id="pin-master-password"
          required
          autoComplete="current-password"
          placeholder="Confirm your master password"
          containerClassName="mt-1.5"
          value={masterPassword}
          onChange={(event) => setMasterPassword(event.target.value)}
        />
        <p className="mt-1 text-xs text-subtle">
          Required to verify ownership before storing the PIN.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="fw-label" htmlFor="pin-new">
            New PIN
          </label>
          <input
            type="password"
            id="pin-new"
            inputMode="numeric"
            autoComplete="off"
            minLength={PIN_MIN_LENGTH}
            maxLength={PIN_MAX_LENGTH}
            required
            placeholder={`${PIN_MIN_LENGTH}+ digits`}
            className="fw-input mt-1.5 text-center tracking-[0.25em]"
            value={newPin}
            onChange={(event) => setNewPin(event.target.value.replace(/\D/g, ''))}
          />
        </div>
        <div>
          <label className="fw-label" htmlFor="pin-confirm">
            Confirm PIN
          </label>
          <input
            type="password"
            id="pin-confirm"
            inputMode="numeric"
            autoComplete="off"
            minLength={PIN_MIN_LENGTH}
            maxLength={PIN_MAX_LENGTH}
            required
            placeholder="Repeat"
            className="fw-input mt-1.5 text-center tracking-[0.25em]"
            value={confirmPin}
            onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, ''))}
          />
        </div>
      </div>

      {errorMessage && <p className="text-xs font-medium text-danger">{errorMessage}</p>}

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="fw-btn fw-btn-ghost fw-btn-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="fw-btn fw-btn-primary fw-btn-sm"
        >
          {isLoading ? (
            <>
              <span className="fw-spinner" aria-hidden="true" />
              Saving...
            </>
          ) : (
            'Save PIN'
          )}
        </button>
      </div>
    </form>
  );
}
