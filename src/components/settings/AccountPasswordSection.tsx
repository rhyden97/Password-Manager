import { useState } from 'react';
import { ChevronUp, Key } from 'lucide-react';
import { AccountPasswordForm } from './AccountPasswordForm';

interface AccountPasswordSectionProps {
  readonly onChangeAccountPassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<boolean>;
  readonly isLoading: boolean;
}

export function AccountPasswordSection({
  onChangeAccountPassword,
  isLoading,
}: AccountPasswordSectionProps) {
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  return (
    <div>
      <h3 className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted">
        Account
      </h3>
      <section className="flex flex-col gap-4 rounded-2xl border border-hairline bg-surface p-4 shadow-2xs sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#007aff] text-white shadow-2xs">
              <Key className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <span className="text-sm font-medium text-ink">Account password</span>
              <p className="mt-0.5 text-xs text-muted">
                Authentication server access
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsChangingPassword(!isChangingPassword)}
            className="fw-btn fw-btn-ghost fw-btn-sm self-start sm:self-auto"
          >
            {isChangingPassword ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                Hide
              </>
            ) : (
              <>
                <Key className="h-3.5 w-3.5" aria-hidden="true" />
                Change password
              </>
            )}
          </button>
        </div>

        {isChangingPassword && (
          <AccountPasswordForm
            onChangeAccountPassword={onChangeAccountPassword}
            onCancel={() => setIsChangingPassword(false)}
            isLoading={isLoading}
          />
        )}
      </section>
      <p className="px-3 pt-2 text-xs leading-relaxed text-muted">
        Changing your account password does not modify your master password or your encrypted data.
      </p>
    </div>
  );
}
