import { useState } from 'react';
import { PasswordInput } from '../ui/PasswordInput';
import { ACCOUNT_PASSWORD_MIN_LENGTH } from '../../constants/cryptoConstants';

interface AccountPasswordFormProps {
  readonly onChangeAccountPassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<boolean>;
  readonly onCancel: () => void;
  readonly isLoading: boolean;
}

export function AccountPasswordForm({
  onChangeAccountPassword,
  onCancel,
  isLoading,
}: AccountPasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentPassword) {
      setPasswordError('Enter your current password');
      return;
    }
    if (newPassword.length < ACCOUNT_PASSWORD_MIN_LENGTH) {
      setPasswordError(
        `New password must be at least ${ACCOUNT_PASSWORD_MIN_LENGTH} characters long`
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordError('');
    const success = await onChangeAccountPassword(currentPassword, newPassword);
    if (success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onCancel();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-1 flex flex-col gap-3 rounded-xl border border-hairline bg-surface-subtle/50 p-4"
    >
      <div>
        <label className="fw-label" htmlFor="account-current-password">
          Current password
        </label>
        <PasswordInput
          id="account-current-password"
          required
          autoComplete="current-password"
          placeholder="Your current password"
          containerClassName="mt-1.5"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="fw-label" htmlFor="account-new-password">
            New password
          </label>
          <PasswordInput
            id="account-new-password"
            required
            autoComplete="new-password"
            minLength={ACCOUNT_PASSWORD_MIN_LENGTH}
            placeholder={`${ACCOUNT_PASSWORD_MIN_LENGTH}+ characters`}
            containerClassName="mt-1.5"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
        </div>
        <div>
          <label className="fw-label" htmlFor="account-confirm-password">
            Confirm new password
          </label>
          <PasswordInput
            id="account-confirm-password"
            required
            autoComplete="new-password"
            minLength={ACCOUNT_PASSWORD_MIN_LENGTH}
            placeholder="Repeat new password"
            containerClassName="mt-1.5"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>
      </div>

      {passwordError && (
        <p className="text-xs font-medium text-danger">{passwordError}</p>
      )}

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
              Updating...
            </>
          ) : (
            'Update password'
          )}
        </button>
      </div>
    </form>
  );
}
