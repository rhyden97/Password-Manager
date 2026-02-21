import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { VaultMetadata, PinAttemptState } from '../types/vault';
import {
  fetchVaultMetadata,
  initializeVaultRecord,
  resetEntireVault,
} from '../services/vaultService';
import { reencryptVaultData } from '../services/reencryptionService';
import {
  deriveKey,
  generateSalt,
  generateValidation,
  verifyValidation,
  encryptMasterKeyWithPin,
  decryptMasterKeyWithPin,
} from '../utils/crypto';
import {
  LEGACY_PBKDF2_ITERATIONS,
  MASTER_PASSWORD_MIN_LENGTH,
  PIN_MAX_ATTEMPTS,
  PIN_MAX_LENGTH,
  PIN_MIN_LENGTH,
  PBKDF2_ITERATIONS,
} from '../constants/cryptoConstants';
import {
  formatPinLockRemaining,
  getPinLockRemainingMs,
  isPinExpired,
  readPinAttempts,
  readStoredPin,
  recordFailedPinAttempt,
  removeLegacyPinStorage,
  removePinAttempts,
  removeStoredPin,
  writePinAttempts,
  writeStoredPin,
} from '../utils/pinStorage';

const EMPTY_ATTEMPTS: PinAttemptState = { failedAttempts: 0, lockedUntil: 0 };
const PIN_PATTERN = new RegExp(`^\\d{${PIN_MIN_LENGTH},${PIN_MAX_LENGTH}}$`);

function resolveIterations(metadata: VaultMetadata): number {
  const value = metadata.kdf_iterations;
  return typeof value === 'number' && Number.isInteger(value) && value > 0
    ? value
    : LEGACY_PBKDF2_ITERATIONS;
}

export function useVault(
  userId: string | undefined,
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void,
  pendingPasswordRef?: { current: string | null }
) {
  const [isVaultInitialized, setIsVaultInitialized] = useState(false);
  const [vaultMetadata, setVaultMetadata] = useState<VaultMetadata | null>(null);
  const [vaultError, setVaultError] = useState<string | null>(null);
  const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);
  const [vaultLoading, setVaultLoading] = useState(false);
  const [pinRefresh, setPinRefresh] = useState(0);
  const onToastRef = useRef(onToast);

  useEffect(() => {
    onToastRef.current = onToast;
  }, [onToast]);

  const storedPinData = useMemo(
    () => (userId ? readStoredPin(userId) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId, pinRefresh]
  );
  const pinAttempts = useMemo(
    () => (userId ? readPinAttempts(userId) : EMPTY_ATTEMPTS),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId, pinRefresh]
  );
  const refreshPinState = useCallback(() => {
    setPinRefresh((value) => value + 1);
  }, []);

  useEffect(() => {
    removeLegacyPinStorage();
  }, []);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    Promise.resolve().then(() => {
      if (!isMounted) return;
      setIsVaultInitialized(false);
      setVaultMetadata(null);
      setMasterKey(null);
      setVaultError(null);
      setVaultLoading(true);
    });

    fetchVaultMetadata(userId).then(async ({ data, error }) => {
      if (!isMounted) return;

      if (error) {
        setVaultLoading(false);
        if (pendingPasswordRef) pendingPasswordRef.current = null;
        setVaultError(error);
        onToastRef.current(`Error verifying vault: ${error}`, 'error');
        return;
      }

      setVaultError(null);

      const pendingPassword = pendingPasswordRef?.current ?? null;
      if (pendingPasswordRef) pendingPasswordRef.current = null;

      if (data && data.salt && data.val_ct && data.val_iv) {
        setVaultMetadata(data);
        setIsVaultInitialized(true);

        if (pendingPassword) {
          try {
            const derived = await deriveKey(
              pendingPassword,
              data.salt,
              resolveIterations(data)
            );
            const isValid = await verifyValidation(data.val_ct, data.val_iv, derived);

            if (isValid && isMounted) {
              let effectiveKey = derived;
              const currentIterations = resolveIterations(data);

              if (currentIterations < PBKDF2_ITERATIONS) {
                const newSalt = generateSalt();
                const newKey = await deriveKey(pendingPassword, newSalt, PBKDF2_ITERATIONS);
                const { val_iv, val_ct } = await generateValidation(newKey);
                const { error: upgradeError } = await reencryptVaultData(
                  userId,
                  derived,
                  newKey,
                  newSalt,
                  val_iv,
                  val_ct,
                  PBKDF2_ITERATIONS
                );

                if (!upgradeError) {
                  effectiveKey = newKey;
                  setVaultMetadata({
                    ...data,
                    salt: newSalt,
                    val_iv,
                    val_ct,
                    kdf_iterations: PBKDF2_ITERATIONS,
                    updated_at: new Date().toISOString(),
                  });
                }
              }

              setMasterKey(effectiveKey);
              setVaultLoading(false);
              return;
            }
          } catch (unlockErr) {
            console.error('Error auto-unlocking vault on login:', unlockErr);
          }
        }

        setVaultLoading(false);
        return;
      }

      if (pendingPassword && pendingPassword.length >= MASTER_PASSWORD_MIN_LENGTH) {
        try {
          const salt = generateSalt();
          const derived = await deriveKey(pendingPassword, salt, PBKDF2_ITERATIONS);
          const { val_iv, val_ct } = await generateValidation(derived);

          const { data: newVault, error: initError } = await initializeVaultRecord(
            userId,
            salt,
            val_iv,
            val_ct,
            PBKDF2_ITERATIONS
          );

          if (isMounted) {
            if (!initError && newVault) {
              setVaultMetadata(newVault);
              setIsVaultInitialized(true);
              setMasterKey(derived);
              setVaultLoading(false);
              onToastRef.current('Vault configured and unlocked', 'success');
              return;
            }
          }
        } catch (initErr) {
          console.error('Error auto-initializing vault on login:', initErr);
        }
      }

      setIsVaultInitialized(false);
      setVaultLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [userId, pendingPasswordRef]);

  const unlockVault = useCallback(
    async (password: string, silent = false): Promise<boolean> => {
      if (!vaultMetadata || !password) {
        if (!silent) onToast('Enter your master password', 'error');
        return false;
      }

      setVaultLoading(true);
      try {
        const derived = await deriveKey(
          password,
          vaultMetadata.salt,
          resolveIterations(vaultMetadata)
        );
        const isValid = await verifyValidation(vaultMetadata.val_ct, vaultMetadata.val_iv, derived);

        if (!isValid) {
          if (!silent) onToast('Incorrect master password', 'error');
          return false;
        }

        let effectiveKey = derived;
        let upgraded = false;
        let upgradeFailed = false;
        const currentIterations = resolveIterations(vaultMetadata);

        if (userId && currentIterations < PBKDF2_ITERATIONS) {
          const newSalt = generateSalt();
          const newKey = await deriveKey(password, newSalt, PBKDF2_ITERATIONS);
          const { val_iv, val_ct } = await generateValidation(newKey);
          const { error } = await reencryptVaultData(
            userId,
            derived,
            newKey,
            newSalt,
            val_iv,
            val_ct,
            PBKDF2_ITERATIONS
          );

          if (!error) {
            effectiveKey = newKey;
            upgraded = true;
            setVaultMetadata((previous) =>
              previous
                ? {
                    ...previous,
                    salt: newSalt,
                    val_iv,
                    val_ct,
                    kdf_iterations: PBKDF2_ITERATIONS,
                    updated_at: new Date().toISOString(),
                  }
                : previous
            );
          } else {
            const { data: refreshed } = await fetchVaultMetadata(userId);
            if (
              refreshed &&
              refreshed.salt !== vaultMetadata.salt &&
              resolveIterations(refreshed) === PBKDF2_ITERATIONS
            ) {
              const recoveredKey = await deriveKey(
                password,
                refreshed.salt,
                PBKDF2_ITERATIONS
              );
              const recovered = await verifyValidation(
                refreshed.val_ct,
                refreshed.val_iv,
                recoveredKey
              );
              if (!recovered) {
                onToast('Could not verify vault after upgrade', 'error');
                return false;
              }
              effectiveKey = recoveredKey;
              upgraded = true;
              setVaultMetadata(refreshed);
            } else {
              upgradeFailed = true;
              onToast(`Could not upgrade vault to 600k: ${error}`, 'error');
            }
          }
        }

        setMasterKey(effectiveKey);
        if (upgraded) {
          onToast('Vault unlocked and upgraded to 600k', 'success');
        } else if (!silent && !upgradeFailed) {
          onToast('Vault unlocked', 'success');
        }
        return true;
      } catch (error) {
        if (!silent) onToast('Failed to derive cryptographic key', 'error');
        console.error(error);
        return false;
      } finally {
        setVaultLoading(false);
      }
    },
    [userId, vaultMetadata, onToast]
  );

  const setupNewVault = useCallback(
    async (password: string): Promise<boolean> => {
      if (!userId || !password) {
        onToast('Invalid master password', 'error');
        return false;
      }
      if (password.length < MASTER_PASSWORD_MIN_LENGTH) {
        onToast(`Master password must be at least ${MASTER_PASSWORD_MIN_LENGTH} characters`, 'error');
        return false;
      }

      setVaultLoading(true);
      try {
        const salt = generateSalt();
        const derived = await deriveKey(password, salt, PBKDF2_ITERATIONS);
        const { val_iv, val_ct } = await generateValidation(derived);

        const { data, error } = await initializeVaultRecord(
          userId,
          salt,
          val_iv,
          val_ct,
          PBKDF2_ITERATIONS
        );

        if (error || !data) {
          onToast(error || 'Failed to initialize vault', 'error');
          return false;
        }

        setVaultMetadata(data);
        setVaultError(null);
        setIsVaultInitialized(true);
        setMasterKey(derived);
        onToast('Vault configured successfully', 'success');
        return true;
      } catch (error) {
        console.error(error);
        onToast('Failed to initialize vault', 'error');
        return false;
      } finally {
        setVaultLoading(false);
      }
    },
    [userId, onToast]
  );

  const unlockWithPin = useCallback(
    async (pin: string): Promise<boolean> => {
      if (!userId || !storedPinData) {
        onToast('No PIN configured on this device', 'error');
        return false;
      }
      if (!PIN_PATTERN.test(pin)) {
        onToast(`PIN must be between ${PIN_MIN_LENGTH} and ${PIN_MAX_LENGTH} digits`, 'error');
        return false;
      }

      const freshPinData = readStoredPin(userId);
      if (!freshPinData || isPinExpired(freshPinData)) {
        removeStoredPin(userId);
        refreshPinState();
        onToast('PIN has expired. Please enter your master password.', 'error');
        return false;
      }

      const currentAttempts = readPinAttempts(userId);
      const remainingLock = getPinLockRemainingMs(currentAttempts);
      if (remainingLock > 0) {
        refreshPinState();
        onToast(
          `PIN temporarily locked. Please wait ${formatPinLockRemaining(remainingLock)}.`,
          'error'
        );
        return false;
      }

      setVaultLoading(true);
      const decryptedPassword = await decryptMasterKeyWithPin(freshPinData, pin);

      if (!decryptedPassword) {
        const nextAttempts = recordFailedPinAttempt(currentAttempts);
        writePinAttempts(userId, nextAttempts);
        refreshPinState();
        setVaultLoading(false);

        if (nextAttempts.lockedUntil > Date.now()) {
          onToast(
            `Incorrect PIN. Locked for ${formatPinLockRemaining(
              nextAttempts.lockedUntil - Date.now()
            )}.`,
            'error'
          );
        } else {
          const remaining = PIN_MAX_ATTEMPTS - nextAttempts.failedAttempts;
          onToast(`Incorrect PIN. Remaining attempts: ${remaining}.`, 'error');
        }
        return false;
      }

      removePinAttempts(userId);
      refreshPinState();

      const unlocked = await unlockVault(decryptedPassword, true);
      setVaultLoading(false);

      if (!unlocked) {
        removeStoredPin(userId);
        refreshPinState();
        onToast('Saved PIN is no longer valid. Please enter your master password.', 'error');
      }
      return unlocked;
    },
    [userId, storedPinData, unlockVault, refreshPinState, onToast]
  );

  const setupDevicePin = useCallback(
    async (masterPassword: string, newPin: string): Promise<boolean> => {
      if (!userId || !vaultMetadata) {
        onToast('Could not verify vault', 'error');
        return false;
      }
      if (!PIN_PATTERN.test(newPin)) {
        onToast(`PIN must be between ${PIN_MIN_LENGTH} and ${PIN_MAX_LENGTH} digits`, 'error');
        return false;
      }
      if (!masterPassword) {
        onToast('Enter your master password to configure PIN', 'error');
        return false;
      }

      setVaultLoading(true);
      try {
        const derived = await deriveKey(
          masterPassword,
          vaultMetadata.salt,
          resolveIterations(vaultMetadata)
        );
        const isValid = await verifyValidation(vaultMetadata.val_ct, vaultMetadata.val_iv, derived);
        if (!isValid) {
          onToast('Incorrect master password', 'error');
          return false;
        }

        const payload = await encryptMasterKeyWithPin(masterPassword, newPin);
        if (!writeStoredPin(userId, payload)) {
          onToast('Could not save PIN on this device', 'error');
          return false;
        }

        removePinAttempts(userId);
        refreshPinState();
        onToast('PIN configured on this device', 'success');
        return true;
      } catch (error) {
        console.error(error);
        onToast('Could not configure PIN', 'error');
        return false;
      } finally {
        setVaultLoading(false);
      }
    },
    [userId, vaultMetadata, refreshPinState, onToast]
  );

  const clearDevicePinSilently = useCallback((): void => {
    if (userId) {
      removeStoredPin(userId);
      removePinAttempts(userId);
    }
    refreshPinState();
  }, [userId, refreshPinState]);

  const removeDevicePin = useCallback((): void => {
    clearDevicePinSilently();
    onToast('PIN removed from this device', 'info');
  }, [clearDevicePinSilently, onToast]);

  const lockVault = useCallback((silent = false): void => {
    setMasterKey(null);
    if (!silent) onToast('Vault locked due to inactivity or security', 'info');
  }, [onToast]);

  const handleResetEntireVault = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;
    setVaultLoading(true);
    const { error } = await resetEntireVault(userId);
    setVaultLoading(false);

    if (error) {
      onToast(error, 'error');
      return false;
    }

    setMasterKey(null);
    setVaultMetadata(null);
    setVaultError(null);
    setIsVaultInitialized(false);
    clearDevicePinSilently();
    onToast('Vault deleted completely', 'info');
    return true;
  }, [userId, clearDevicePinSilently, onToast]);

  const changeVaultPassword = useCallback(
    async (newPassword: string): Promise<boolean> => {
      if (!userId || !masterKey) {
        onToast('Vault must be unlocked to change password', 'error');
        return false;
      }
      if (newPassword.length < MASTER_PASSWORD_MIN_LENGTH) {
        onToast(
          `Master password must be at least ${MASTER_PASSWORD_MIN_LENGTH} characters`,
          'error'
        );
        return false;
      }

      setVaultLoading(true);
      try {
        const newSalt = generateSalt();
        const newKey = await deriveKey(newPassword, newSalt, PBKDF2_ITERATIONS);
        const { val_iv, val_ct } = await generateValidation(newKey);

        const { error } = await reencryptVaultData(
          userId,
          masterKey,
          newKey,
          newSalt,
          val_iv,
          val_ct,
          PBKDF2_ITERATIONS
        );

        if (error) {
          onToast(`Error updating vault password: ${error}`, 'error');
          return false;
        }

        setMasterKey(newKey);
        setVaultMetadata((previous) =>
          previous
            ? {
                ...previous,
                salt: newSalt,
                val_iv,
                val_ct,
                kdf_iterations: PBKDF2_ITERATIONS,
                updated_at: new Date().toISOString(),
              }
            : null
        );

        clearDevicePinSilently();
        return true;
      } catch (error) {
        console.error('Error changing vault password:', error);
        onToast('Unexpected error while re-encrypting vault', 'error');
        return false;
      } finally {
        setVaultLoading(false);
      }
    },
    [userId, masterKey, clearDevicePinSilently, onToast]
  );

  return {
    isVaultInitialized,
    vaultMetadata,
    vaultError,
    masterKey,
    vaultLoading,
    hasPinConfigured: Boolean(storedPinData),
    pinLockedUntil: pinAttempts.lockedUntil,
    unlockVault,
    setupNewVault,
    unlockWithPin,
    setupDevicePin,
    removeDevicePin,
    clearDevicePinSilently,
    lockVault,
    handleResetEntireVault,
    changeVaultPassword,
  };
}
