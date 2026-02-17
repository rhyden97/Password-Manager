import { PBKDF2_ITERATIONS } from '../constants/cryptoConstants';
import { supabase } from './supabase';
import { VaultMetadata } from '../types/vault';

export interface ServiceResult<T> {
  readonly data: T | null;
  readonly error: string | null;
}

export async function fetchVaultMetadata(userId: string): Promise<ServiceResult<VaultMetadata>> {
  if (!userId) {
    return { data: null, error: 'User ID is required' };
  }

  const { data, error } = await supabase
    .from('vaults')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as VaultMetadata | null, error: null };
}

export async function initializeVaultRecord(
  userId: string,
  salt: string,
  valIv: string,
  valCt: string,
  kdfIterations: number = PBKDF2_ITERATIONS
): Promise<ServiceResult<VaultMetadata>> {
  if (!userId || !salt || !valIv || !valCt) {
    return { data: null, error: 'Missing mandatory vault parameters' };
  }

  const basePayload = {
    user_id: userId,
    salt,
    val_iv: valIv,
    val_ct: valCt,
    updated_at: new Date().toISOString(),
  };

  const payload = {
    ...basePayload,
    kdf_iterations: kdfIterations,
  };

  let { data, error } = await supabase.from('vaults').upsert(payload).select().single();

  if (error && /kdf_iterations/i.test(error.message)) {
    const legacyResult = await supabase.from('vaults').upsert(basePayload).select().single();
    data = legacyResult.data;
    error = legacyResult.error;
  }

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as VaultMetadata, error: null };
}

export async function resetEntireVault(userId: string): Promise<ServiceResult<boolean>> {
  if (!userId) {
    return { data: false, error: 'User ID is required' };
  }

  const [credRes, apiKeyRes, secRes, vaultRes] = await Promise.all([
    supabase.from('credentials').delete().eq('user_id', userId),
    supabase.from('api_keys').delete().eq('user_id', userId),
    supabase.from('security_codes').delete().eq('user_id', userId),
    supabase.from('vaults').delete().eq('user_id', userId),
  ]);

  if (credRes.error || apiKeyRes.error || secRes.error || vaultRes.error) {
    const errorMsg =
      credRes.error?.message ||
      apiKeyRes.error?.message ||
      secRes.error?.message ||
      vaultRes.error?.message;
    return { data: false, error: errorMsg ?? 'Error deleting vault' };
  }

  return { data: true, error: null };
}
