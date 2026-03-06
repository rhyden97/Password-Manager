import { useState } from 'react';
import { VaultUnlockView } from './VaultUnlockView';
import { PinUnlockView } from './PinUnlockView';

interface VaultLockedFlowProps {
  readonly hasPinConfigured: boolean;
  readonly pinLockedUntil: number;
  readonly isLoading: boolean;
  readonly onUnlockVault: (password: string) => Promise<boolean>;
  readonly onUnlockWithPin: (pin: string) => Promise<boolean>;
  readonly onSignOut: () => void;
}

export function VaultLockedFlow({
  hasPinConfigured,
  pinLockedUntil,
  isLoading,
  onUnlockVault,
  onUnlockWithPin,
  onSignOut,
}: VaultLockedFlowProps) {
  const [isUsingPinFallback, setIsUsingPinFallback] = useState(false);

  if (hasPinConfigured && !isUsingPinFallback) {
    return (
      <PinUnlockView
        onUnlockWithPin={onUnlockWithPin}
        onSwitchToMasterPassword={() => setIsUsingPinFallback(true)}
        onSignOut={onSignOut}
        isLoading={isLoading}
        pinLockedUntil={pinLockedUntil}
      />
    );
  }

  return (
    <VaultUnlockView
      onUnlock={onUnlockVault}
      hasPinConfigured={hasPinConfigured}
      onSwitchToPin={() => setIsUsingPinFallback(false)}
      onSignOut={onSignOut}
      isLoading={isLoading}
    />
  );
}
