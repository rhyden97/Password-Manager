import { useState, useEffect, useCallback, useRef } from 'react';
import { ActiveTab } from './types/vault';
import { isSupabaseConfigured } from './services/supabase';
import { useToast } from './hooks/useToast';
import { useAuth } from './hooks/useAuth';
import { useVault } from './hooks/useVault';
import { useAutoLock } from './hooks/useAutoLock';
import { useCredentials } from './hooks/useCredentials';
import { useApiKeys } from './hooks/useApiKeys';
import { useSecurityCodes } from './hooks/useSecurityCodes';
import { usePasswordGenerator } from './hooks/usePasswordGenerator';
import { useClipboard } from './hooks/useClipboard';

import { ToastContainer } from './components/common/ToastContainer';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { MainTabs } from './components/common/MainTabs';
import { MissingConfigView } from './components/common/MissingConfigView';
import { AppGates } from './components/common/AppGates';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('passwords');
  const { toasts, showToast } = useToast();
  const { copyToClipboard } = useClipboard(showToast);
  const pendingLoginPasswordRef = useRef<string | null>(null);

  const auth = useAuth(showToast, (pass) => { pendingLoginPasswordRef.current = pass; });
  const vault = useVault(auth.session?.user?.id, showToast, pendingLoginPasswordRef);
  const credentials = useCredentials(showToast);
  const apiKeys = useApiKeys(showToast);
  const securityCodes = useSecurityCodes(showToast);
  const generator = usePasswordGenerator();

  const { clearCredentials } = credentials;
  const { clearApiKeys } = apiKeys;
  const { clearSecurityCodes } = securityCodes;
  const { lockVault: lockVaultInternal, clearDevicePinSilently } = vault;
  const { handleSignOut: signOut } = auth;

  const clearSecrets = useCallback(() => {
    clearCredentials();
    clearApiKeys();
    clearSecurityCodes();
  }, [clearCredentials, clearApiKeys, clearSecurityCodes]);

  const lockVault = useCallback(() => {
    pendingLoginPasswordRef.current = null;
    clearSecrets();
    lockVaultInternal();
  }, [clearSecrets, lockVaultInternal]);

  const autoLock = useAutoLock(Boolean(vault.masterKey), lockVault);

  const handleSignOut = useCallback(async () => {
    pendingLoginPasswordRef.current = null;
    clearSecrets();
    clearDevicePinSilently();
    lockVaultInternal(true);
    await signOut();
  }, [clearSecrets, clearDevicePinSilently, lockVaultInternal, signOut]);

  const handleChangeAccountPassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<boolean> => {
      const accountSuccess = await auth.handleChangePassword(currentPassword, newPassword);
      if (!accountSuccess) return false;

      if (vault.isVaultInitialized && vault.masterKey) {
        const vaultSuccess = await vault.changeVaultPassword(newPassword);
        if (!vaultSuccess) {
          showToast('Account password updated, but vault sync failed.', 'error');
          return false;
        }
      }
      showToast('Account and vault passwords updated successfully', 'success');
      return true;
    },
    [auth, vault, showToast]
  );

  useEffect(() => {
    if (!vault.masterKey || !auth.session?.user?.id) return;
    credentials.loadCredentials(vault.masterKey, auth.session.user.id);
    apiKeys.loadApiKeys(vault.masterKey, auth.session.user.id);
    securityCodes.loadSecurityCodes(vault.masterKey, auth.session.user.id);
  }, [vault.masterKey, auth.session?.user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (!vault.masterKey) clearSecrets(); }, [vault.masterKey, clearSecrets]);
  useEffect(() => { if (!auth.session && vault.masterKey) lockVault(); }, [auth.session, vault.masterKey, lockVault]);

  useEffect(() => {
    if (!vault.masterKey) return;
    const onVis = () => { if (document.visibilityState === 'hidden') lockVault(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pagehide', lockVault);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pagehide', lockVault);
    };
  }, [vault.masterKey, lockVault]);

  if (!isSupabaseConfigured) return <MissingConfigView />;
  if (!auth.session || !vault.masterKey) {
    return <AppGates auth={auth} vault={vault} toasts={toasts} onSignOut={handleSignOut} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-body">
      <Header
        userEmail={auth.session.user.email}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onLockVault={lockVault}
        onSignOut={handleSignOut}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-5 md:px-8 md:pb-12 md:pt-8">
        <MainTabs
          activeTab={activeTab}
          masterKey={vault.masterKey}
          userId={auth.session.user.id}
          userEmail={auth.session.user.email}
          onCopy={copyToClipboard}
          credentials={credentials}
          apiKeys={apiKeys}
          securityCodes={securityCodes}
          generator={generator}
          autoLock={autoLock}
          vault={vault}
          onChangeAccountPassword={handleChangeAccountPassword}
          onSignOut={handleSignOut}
          isLoading={vault.vaultLoading || auth.authLoading}
        />
      </main>
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
      <ToastContainer toasts={toasts} />
    </div>
  );
}
