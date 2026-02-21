import { useState, useEffect, useRef, useCallback } from 'react';
import { AutoLockTimeoutMinutes } from '../types/vault';
import { safeGetItem, safeSetItem } from '../utils/storage';

const STORAGE_KEY_AUTO_LOCK = 'fortress_auto_lock_minutes';
const VALID_TIMEOUTS: readonly AutoLockTimeoutMinutes[] = ['1', '5', '15', '30', 'never'];

function readAutoLockTimeout(): AutoLockTimeoutMinutes {
  const stored = safeGetItem(STORAGE_KEY_AUTO_LOCK);
  return VALID_TIMEOUTS.includes(stored as AutoLockTimeoutMinutes)
    ? (stored as AutoLockTimeoutMinutes)
    : '5';
}

export function useAutoLock(isUnlocked: boolean, onLock: () => void) {
  const [autoLockMinutes, setAutoLockMinutes] = useState<AutoLockTimeoutMinutes>(readAutoLockTimeout);

  const timerRef = useRef<number | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!isUnlocked || autoLockMinutes === 'never') {
      return;
    }

    const durationMs = parseInt(autoLockMinutes, 10) * 60 * 1000;
    timerRef.current = window.setTimeout(() => {
      onLock();
    }, durationMs);
  }, [isUnlocked, autoLockMinutes, onLock]);

  const updateAutoLock = useCallback(
    (minutes: AutoLockTimeoutMinutes) => {
      setAutoLockMinutes(minutes);
      safeSetItem(STORAGE_KEY_AUTO_LOCK, minutes);
      resetTimer();
    },
    [resetTimer]
  );

  useEffect(() => {
    if (!isUnlocked || autoLockMinutes === 'never') return;

    const activityEvents = ['mousemove', 'keydown', 'touchstart', 'click'];
    const handleActivity = () => resetTimer();

    activityEvents.forEach((event) => window.addEventListener(event, handleActivity));
    resetTimer();

    return () => {
      activityEvents.forEach((event) => window.removeEventListener(event, handleActivity));
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [isUnlocked, autoLockMinutes, resetTimer]);

  return { autoLockMinutes, updateAutoLock };
}
