import { supabase } from './supabase';
import { ServiceResult } from './vaultService';

export interface RawApiKeyRow {
  readonly id: string;
  readonly user_id: string;
  readonly name_ct: string;
  readonly key_ct: string;
  readonly environment_ct?: string | null;
  readonly scopes_ct?: string | null;
  readonly expires_at_ct?: string | null;
  readonly notes_ct?: string | null;
  readonly ivs: Record<string, string>;
  readonly created_at?: string;
  readonly updated_at?: string;
}

export async function fetchRawApiKeys(userId: string): Promise<ServiceResult<RawApiKeyRow[]>> {
  if (!userId) {
    return { data: [], error: 'User ID is required' };
  }

  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: (data as RawApiKeyRow[]) ?? [], error: null };
}

export async function insertApiKeyRecord(
  userId: string,
  ciphertexts: Record<string, string>,
  ivs: Record<string, string>
): Promise<ServiceResult<RawApiKeyRow>> {
  if (!userId) {
    return { data: null, error: 'User ID is required' };
  }

  const payload = {
    user_id: userId,
    name_ct: ciphertexts.name_ct,
    key_ct: ciphertexts.key_ct,
    environment_ct: ciphertexts.environment_ct || '',
    scopes_ct: ciphertexts.scopes_ct || '',
    expires_at_ct: ciphertexts.expires_at_ct || '',
    notes_ct: ciphertexts.notes_ct || '',
    ivs,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('api_keys').insert(payload).select().single();
  if (error) {
    return { data: null, error: error.message };
  }
  return { data: data as RawApiKeyRow, error: null };
}

export async function updateApiKeyRecord(
  apiKeyId: string,
  ciphertexts: Record<string, string>,
  ivs: Record<string, string>
): Promise<ServiceResult<RawApiKeyRow>> {
  if (!apiKeyId) {
    return { data: null, error: 'API key ID is required' };
  }

  const payload = {
    name_ct: ciphertexts.name_ct,
    key_ct: ciphertexts.key_ct,
    environment_ct: ciphertexts.environment_ct || '',
    scopes_ct: ciphertexts.scopes_ct || '',
    expires_at_ct: ciphertexts.expires_at_ct || '',
    notes_ct: ciphertexts.notes_ct || '',
    ivs,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('api_keys')
    .update(payload)
    .eq('id', apiKeyId)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }
  return { data: data as RawApiKeyRow, error: null };
}

export async function deleteApiKeyRecord(apiKeyId: string): Promise<ServiceResult<boolean>> {
  if (!apiKeyId) {
    return { data: false, error: 'API key ID is required' };
  }

  const { error } = await supabase.from('api_keys').delete().eq('id', apiKeyId);
  if (error) {
    return { data: false, error: error.message };
  }
  return { data: true, error: null };
}
