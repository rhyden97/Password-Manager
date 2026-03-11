import { ActiveTab } from '../../types/vault';
import { useCredentials } from '../../hooks/useCredentials';
import { useApiKeys } from '../../hooks/useApiKeys';
import { useSecurityCodes } from '../../hooks/useSecurityCodes';
import { usePasswordGenerator } from '../../hooks/usePasswordGenerator';
import { useAutoLock } from '../../hooks/useAutoLock';
import { useVault } from '../../hooks/useVault';

import { PasswordsView } from '../passwords/PasswordsView';
import { ApiKeysView } from '../api-keys/ApiKeysView';
import { SecurityCodesView } from '../security-codes/SecurityCodesView';
import { PasswordGeneratorView } from '../generator/PasswordGeneratorView';
import { SettingsView } from '../settings/SettingsView';

interface MainTabsProps {
  readonly activeTab: ActiveTab;
  readonly masterKey: CryptoKey;
  readonly userId: string;
  readonly userEmail?: string;
  readonly onCopy: (text: string, label: string) => void;
  readonly credentials: ReturnType<typeof useCredentials>;
  readonly apiKeys: ReturnType<typeof useApiKeys>;
  readonly securityCodes: ReturnType<typeof useSecurityCodes>;
  readonly generator: ReturnType<typeof usePasswordGenerator>;
  readonly autoLock: ReturnType<typeof useAutoLock>;
  readonly vault: ReturnType<typeof useVault>;
  readonly onChangeAccountPassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<boolean>;
  readonly onSignOut: () => void;
  readonly isLoading: boolean;
}

export function MainTabs({
  activeTab,
  masterKey,
  userId,
  userEmail,
  onCopy,
  credentials,
  apiKeys,
  securityCodes,
  generator,
  autoLock,
  vault,
  onChangeAccountPassword,
  onSignOut,
  isLoading,
}: MainTabsProps) {
  if (activeTab === 'passwords') {
    return (
      <PasswordsView
        credentials={credentials.filteredCredentials}
        totalCredentialsCount={credentials.credentials.length}
        searchTerm={credentials.searchTerm}
        onSearchChange={credentials.setSearchTerm}
        visiblePasswords={credentials.visiblePasswords}
        onToggleVisibility={credentials.togglePasswordVisibility}
        onCopy={onCopy}
        onSave={(data) => credentials.saveCredential(data, masterKey, userId)}
        onDelete={credentials.removeCredential}
        isLoading={credentials.isLoading}
        apiKeysCount={apiKeys.apiKeys.length}
        securityCodesCount={securityCodes.securityCodes.length}
      />
    );
  }

  if (activeTab === 'api_keys') {
    return (
      <ApiKeysView
        apiKeys={apiKeys.filteredApiKeys}
        searchTerm={apiKeys.searchTerm}
        onSearchChange={apiKeys.setSearchTerm}
        visibleKeys={apiKeys.visibleKeys}
        onToggleVisibility={apiKeys.toggleKeyVisibility}
        onCopy={onCopy}
        onSave={(data) => apiKeys.saveApiKey(data, masterKey, userId)}
        onDelete={apiKeys.removeApiKey}
        isLoading={apiKeys.isLoading}
      />
    );
  }

  if (activeTab === 'security_codes') {
    return (
      <SecurityCodesView
        securityCodes={securityCodes.filteredSecurityCodes}
        searchTerm={securityCodes.searchTerm}
        onSearchChange={securityCodes.setSearchTerm}
        onCopy={onCopy}
        onConsumeCode={(id, code) => securityCodes.consumeSecurityCode(id, code, masterKey, userId)}
        onSave={(data) => securityCodes.saveSecurityCode(data, masterKey, userId)}
        onDelete={securityCodes.removeSecurityCode}
        isLoading={securityCodes.isLoading}
      />
    );
  }

  if (activeTab === 'generator') {
    return (
      <PasswordGeneratorView
        config={generator.config}
        generatedPassword={generator.generatedPassword}
        strength={generator.strength}
        entropyBits={generator.entropyBits}
        onRegenerate={generator.regeneratePassword}
        onUpdateConfig={generator.updateConfig}
        onCopy={onCopy}
      />
    );
  }

  return (
    <SettingsView
      userEmail={userEmail}
      autoLockMinutes={autoLock.autoLockMinutes}
      onUpdateAutoLock={autoLock.updateAutoLock}
      hasPinConfigured={vault.hasPinConfigured}
      onSetupPin={vault.setupDevicePin}
      onRemovePin={vault.removeDevicePin}
      onChangeAccountPassword={onChangeAccountPassword}
      onResetVault={vault.handleResetEntireVault}
      onSignOut={onSignOut}
      isLoading={isLoading}
    />
  );
}
