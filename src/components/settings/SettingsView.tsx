import { ChevronDown, Clock, User } from 'lucide-react';
import { AutoLockTimeoutMinutes } from '../../types/vault';
import { PageHeader } from '../ui/PageHeader';
import { AppearanceSection } from './AppearanceSection';
import { PinSettingsSection } from './PinSettingsSection';
import { AccountPasswordSection } from './AccountPasswordSection';
import { DangerZoneSection } from './DangerZoneSection';

interface SettingsViewProps {
  readonly userEmail?: string;
  readonly autoLockMinutes: AutoLockTimeoutMinutes;
  readonly onUpdateAutoLock: (minutes: AutoLockTimeoutMinutes) => void;
  readonly hasPinConfigured: boolean;
  readonly onSetupPin: (masterPassword: string, newPin: string) => Promise<boolean>;
  readonly onRemovePin: () => void;
  readonly onChangeAccountPassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<boolean>;
  readonly onResetVault: () => Promise<boolean>;
  readonly onSignOut: () => void;
  readonly isLoading: boolean;
}

export function SettingsView({
  userEmail,
  autoLockMinutes,
  onUpdateAutoLock,
  hasPinConfigured,
  onSetupPin,
  onRemovePin,
  onChangeAccountPassword,
  onResetVault,
  isLoading,
}: SettingsViewProps) {
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : 'F';

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-7 pb-12 animate-fade-in">
      <PageHeader
        title="Settings"
        description="Manage preferences, PIN unlock, and credentials."
      />

      <section className="flex items-center gap-4 rounded-2xl border border-hairline bg-surface p-4 shadow-2xs sm:p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-subtle border border-hairline text-primary font-semibold text-xl shadow-2xs">
          {userEmail ? userInitial : <User className="h-6 w-6" aria-hidden="true" />}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold text-ink">
            {userEmail || 'Fortress User'}
          </h2>
          <p className="text-xs text-muted">Encrypted vault</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            <span>Active session</span>
          </div>
        </div>
      </section>

      <AppearanceSection />

      <div>
        <h3 className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted">
          Security
        </h3>
        <section className="flex flex-col gap-4 rounded-2xl border border-hairline bg-surface p-4 shadow-2xs sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#ff9500] text-white shadow-2xs">
                <Clock className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <span className="text-sm font-medium text-ink">Auto-lock on inactivity</span>
                <p className="mt-0.5 text-xs text-muted">
                  Lock vault after idle time
                </p>
              </div>
            </div>

            <div className="relative self-start sm:self-auto">
              <select
                value={autoLockMinutes}
                onChange={(event) =>
                  onUpdateAutoLock(event.target.value as AutoLockTimeoutMinutes)
                }
                className="appearance-none rounded-full border border-hairline bg-surface-subtle py-1.5 pl-3.5 pr-8 text-xs font-medium text-ink shadow-2xs transition-colors hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Auto-lock timeout"
              >
                <option value="1">1 minute</option>
                <option value="5">5 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="never">Never</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="border-t border-hairline" />

          <PinSettingsSection
            hasPinConfigured={hasPinConfigured}
            onSetupPin={onSetupPin}
            onRemovePin={onRemovePin}
            isLoading={isLoading}
          />
        </section>
      </div>

      <AccountPasswordSection
        onChangeAccountPassword={onChangeAccountPassword}
        isLoading={isLoading}
      />

      <DangerZoneSection onResetVault={onResetVault} />
    </div>
  );
}
