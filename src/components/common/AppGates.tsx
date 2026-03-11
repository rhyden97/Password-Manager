import { AuthFlow } from '../auth/AuthFlow';
import { VaultLoadingView } from '../vault/VaultLoadingView';
import { VaultSetupView } from '../vault/VaultSetupView';
import { VaultLockedFlow } from '../vault/VaultLockedFlow';
import { VaultErrorView } from '../vault/VaultErrorView';
import { ToastContainer } from './ToastContainer';
import { ToastItem } from '../../types/toast';
import { useAuth } from '../../hooks/useAuth';
import { useVault } from '../../hooks/useVault';

interface AppGatesProps {
  readonly auth: ReturnType<typeof useAuth>;
  readonly vault: ReturnType<typeof useVault>;
  readonly toasts: ToastItem[];
  readonly onSignOut: () => void;
}

export function AppGates({ auth, vault, toasts, onSignOut }: AppGatesProps) {
  if (!auth.session) {
    return (
      <>
        <AuthFlow
          email={auth.authEmail}
          onChangeEmail={auth.setAuthEmail}
          password={auth.authPassword}
          onChangePassword={auth.setAuthPassword}
          isRegistering={auth.isRegistering}
          onToggleRegistering={auth.setIsRegistering}
          rememberCreds={auth.rememberCreds}
          onToggleRememberCreds={auth.setRememberCreds}
          isLoading={auth.authLoading}
          isRegistrationSuccess={auth.registrationSuccess}
          onDismissRegistrationSuccess={() => auth.setRegistrationSuccess(false)}
          onSubmit={auth.isRegistering ? auth.handleRegister : auth.handleSignIn}
        />
        <ToastContainer toasts={toasts} />
      </>
    );
  }

  if (vault.vaultError) {
    return (
      <>
        <VaultErrorView
          message={vault.vaultError}
          onRetry={() => window.location.reload()}
          onSignOut={onSignOut}
        />
        <ToastContainer toasts={toasts} />
      </>
    );
  }

  if (vault.vaultLoading && !vault.masterKey) {
    return (
      <>
        <VaultLoadingView message="Unlocking vault..." />
        <ToastContainer toasts={toasts} />
      </>
    );
  }

  if (!vault.isVaultInitialized) {
    return (
      <>
        <VaultSetupView
          onSetupVault={(pass) => vault.setupNewVault(pass)}
          onSignOut={onSignOut}
          isLoading={vault.vaultLoading}
        />
        <ToastContainer toasts={toasts} />
      </>
    );
  }

  return (
    <>
      <VaultLockedFlow
        hasPinConfigured={vault.hasPinConfigured}
        pinLockedUntil={vault.pinLockedUntil}
        isLoading={vault.vaultLoading}
        onUnlockVault={vault.unlockVault}
        onUnlockWithPin={vault.unlockWithPin}
        onSignOut={onSignOut}
      />
      <ToastContainer toasts={toasts} />
    </>
  );
}
