import { Session, Subscription } from '@supabase/supabase-js';
import { ACCOUNT_PASSWORD_MIN_LENGTH } from '../constants/cryptoConstants';
import { supabase } from './supabase';
import { ServiceResult } from './vaultService';

export async function signInWithEmail(
  email: string,
  password: string
): Promise<ServiceResult<Session>> {
  if (!email || !password) {
    return { data: null, error: 'Email and password are required' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data.session, error: null };
}

export async function registerWithEmail(
  email: string,
  password: string
): Promise<ServiceResult<Session | null>> {
  if (!email || !password) {
    return { data: null, error: 'Email and password are required' };
  }
  if (password.length < ACCOUNT_PASSWORD_MIN_LENGTH) {
    return {
      data: null,
      error: `Password must be at least ${ACCOUNT_PASSWORD_MIN_LENGTH} characters`,
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data.session, error: null };
}

export async function signOutUser(): Promise<ServiceResult<boolean>> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { data: false, error: error.message };
  }
  return { data: true, error: null };
}

export async function updateAccountPassword(
  currentPassword: string,
  newPassword: string
): Promise<ServiceResult<boolean>> {
  if (!currentPassword) {
    return { data: false, error: 'Current password is required' };
  }
  if (!newPassword || newPassword.length < ACCOUNT_PASSWORD_MIN_LENGTH) {
    return {
      data: false,
      error: `Password must be at least ${ACCOUNT_PASSWORD_MIN_LENGTH} characters`,
    };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user?.email) {
    return { data: false, error: 'Could not verify the current session' };
  }

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: userData.user.email,
    password: currentPassword,
  });
  if (reauthError) {
    return { data: false, error: 'Current password is incorrect' };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return { data: false, error: error.message };
  }
  return { data: true, error: null };
}

export async function getCurrentSession(): Promise<ServiceResult<Session>> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    return { data: null, error: error.message };
  }
  return { data: data.session, error: null };
}

export function subscribeToAuthChanges(
  callback: (session: Session | null) => void
): { unsubscribe: () => void } {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return {
    unsubscribe: () => {
      (data.subscription as Subscription)?.unsubscribe();
    },
  };
}
