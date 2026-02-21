import { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import {
  signInWithEmail,
  registerWithEmail,
  signOutUser,
  updateAccountPassword,
  getCurrentSession,
  subscribeToAuthChanges,
} from '../services/authService';
import { ACCOUNT_PASSWORD_MIN_LENGTH } from '../constants/cryptoConstants';
import {
  safeGetItem,
  safeJsonParse,
  safeRemoveItem,
  safeSetItem,
} from '../utils/storage';

const STORAGE_KEY_REMEMBER = 'fortress_remembered_auth';

interface RememberedAuth {
  readonly email?: string;
}

function readRememberedEmail(): string {
  const remembered = safeJsonParse<RememberedAuth>(safeGetItem(STORAGE_KEY_REMEMBER));
  return typeof remembered?.email === 'string' ? remembered.email : '';
}

export function useAuth(
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void,
  onSignInSuccess?: (password: string) => void
) {
  const [session, setSession] = useState<Session | null>(null);
  const [authEmail, setAuthEmail] = useState(readRememberedEmail);
  const [authPassword, setAuthPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [rememberCreds, setRememberCredsState] = useState(() => Boolean(readRememberedEmail()));

  useEffect(() => {
    getCurrentSession().then(({ data }) => setSession(data));
    const { unsubscribe } = subscribeToAuthChanges((newSession) => setSession(newSession));
    return () => unsubscribe();
  }, []);

  const setRememberCreds = useCallback((remember: boolean) => {
    setRememberCredsState(remember);
    if (!remember) safeRemoveItem(STORAGE_KEY_REMEMBER);
  }, []);

  const handleSignIn = useCallback(async (): Promise<boolean> => {
    if (!authEmail || !authPassword) {
      onToast('Enter your email and password', 'error');
      return false;
    }

    const passwordForUnlock = authPassword;

    setAuthLoading(true);
    const { data, error } = await signInWithEmail(authEmail, authPassword);
    setAuthLoading(false);

    if (error || !data) {
      onToast(error || 'Failed to sign in', 'error');
      return false;
    }

    setAuthPassword('');

    if (rememberCreds) {
      safeSetItem(STORAGE_KEY_REMEMBER, JSON.stringify({ email: authEmail.trim().toLowerCase() }));
    } else {
      safeRemoveItem(STORAGE_KEY_REMEMBER);
    }

    setSession(data);
    onSignInSuccess?.(passwordForUnlock);

    onToast('Signed in successfully', 'success');
    return true;
  }, [authEmail, authPassword, rememberCreds, onSignInSuccess, onToast]);

  const handleRegister = useCallback(async (): Promise<boolean> => {
    if (!authEmail || !authPassword) {
      onToast('Enter a valid email and password', 'error');
      return false;
    }
    if (authPassword.length < ACCOUNT_PASSWORD_MIN_LENGTH) {
      onToast(
        `Password must be at least ${ACCOUNT_PASSWORD_MIN_LENGTH} characters`,
        'error'
      );
      return false;
    }

    const passwordForUnlock = authPassword;

    setAuthLoading(true);
    const { data, error } = await registerWithEmail(authEmail, authPassword);
    setAuthLoading(false);

    if (error) {
      onToast(error, 'error');
      return false;
    }

    setAuthPassword('');

    if (data) {
      setSession(data);
      onSignInSuccess?.(passwordForUnlock);
      onToast('Account created and signed in successfully', 'success');
      return true;
    }

    setRegistrationSuccess(true);
    onToast('Account created. Please check your confirmation email', 'success');
    return true;
  }, [authEmail, authPassword, onSignInSuccess, onToast]);

  const handleSignOut = useCallback(async (): Promise<void> => {
    await signOutUser();
    setSession(null);
    setAuthPassword('');
    if (!rememberCreds) setAuthEmail('');
    onToast('Signed out', 'info');
  }, [rememberCreds, onToast]);

  const handleChangePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<boolean> => {
      if (newPassword.length < ACCOUNT_PASSWORD_MIN_LENGTH) {
        onToast(
          `Password must be at least ${ACCOUNT_PASSWORD_MIN_LENGTH} characters`,
          'error'
        );
        return false;
      }

      setAuthLoading(true);
      const { error } = await updateAccountPassword(currentPassword, newPassword);
      setAuthLoading(false);

      if (error) {
        onToast(error, 'error');
        return false;
      }

      onToast('Account password updated', 'success');
      return true;
    },
    [onToast]
  );

  return {
    session,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    isRegistering,
    setIsRegistering,
    registrationSuccess,
    setRegistrationSuccess,
    authLoading,
    showAuthPassword,
    setShowAuthPassword,
    rememberCreds,
    setRememberCreds,
    handleSignIn,
    handleRegister,
    handleSignOut,
    handleChangePassword,
  };
}
