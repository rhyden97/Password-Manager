import { useEffect, useRef, useState } from 'react';
import { PIN_MAX_LENGTH, PIN_MIN_LENGTH } from '../constants/cryptoConstants';

interface UsePinUnlockOptions {
  readonly onUnlockWithPin: (pin: string) => Promise<boolean>;
  readonly pinLockedUntil: number;
  readonly isLoading: boolean;
}

export function usePinUnlock({
  onUnlockWithPin,
  pinLockedUntil,
  isLoading,
}: UsePinUnlockOptions) {
  const [pin, setPin] = useState('');
  const [lockRemainingMs, setLockRemainingMs] = useState(0);
  const [hasShaken, setHasShaken] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const tick = () => setLockRemainingMs(Math.max(0, pinLockedUntil - Date.now()));
    tick();
    if (pinLockedUntil <= Date.now()) return;
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [pinLockedUntil]);

  const handleSubmit = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    if (pin.length < PIN_MIN_LENGTH || lockRemainingMs > 0 || isLoading) return;
    const success = await onUnlockWithPin(pin);
    if (!success) {
      setHasShaken(true);
      window.setTimeout(() => setHasShaken(false), 400);
    }
    setPin('');
  };

  const handleKeypadPress = (digit: string) => {
    if (lockRemainingMs > 0 || isLoading) return;
    if (pin.length < PIN_MAX_LENGTH) setPin((cur) => cur + digit);
  };

  const handleKeypadBackspace = () => {
    if (lockRemainingMs > 0 || isLoading) return;
    setPin((cur) => cur.slice(0, -1));
  };

  const handleClearPin = () => {
    if (lockRemainingMs > 0 || isLoading) return;
    setPin('');
    inputRef.current?.focus();
  };

  const isLocked = lockRemainingMs > 0;
  const lockSeconds = Math.ceil(lockRemainingMs / 1000);

  const handlersRef = useRef({ handleSubmit, handleKeypadPress, handleKeypadBackspace, handleClearPin });
  useEffect(() => {
    handlersRef.current = { handleSubmit, handleKeypadPress, handleKeypadBackspace, handleClearPin };
  });

  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isLocked || isLoading) return;
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handlersRef.current.handleKeypadPress(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handlersRef.current.handleKeypadBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handlersRef.current.handleSubmit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handlersRef.current.handleClearPin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, isLoading]);

  return {
    pin,
    setPin,
    inputRef,
    isLocked,
    lockSeconds,
    hasShaken,
    handleSubmit,
    handleKeypadPress,
    handleKeypadBackspace,
    handleClearPin,
  };
}
