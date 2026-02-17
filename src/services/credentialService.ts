import { supabase } from './supabase';
import { ServiceResult } from './vaultService';

export interface RawCredentialRow {
  readonly id: string;
  readonly user_id: string;
  readonly title_ct: string;
  readonly url_ct?: string | null;
  readonly username_ct: string;
  readonly password_ct: string;
  readonly notes_ct?: string | null;
  readonly ivs: Record<string, string>;
  readonly created_at?: string;
  readonly updated_at?: string;
}

export async function fetchRawCredentials(userId: string): Promise<ServiceResult<RawCredentialRow[]>> {
  if (!userId) {
    return { data: [], error: 'User ID is required' };
  }

  const { data, error } = await supabase
    .from('credentials')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: (data as RawCredentialRow[]) ?? [], error: null };
}

export async function insertCredentialRecord(
  userId: string,
  ciphertexts: Record<string, string>,
  ivs: Record<string, string>
): Promise<ServiceResult<RawCredentialRow>> {
  if (!userId) {
    return { data: null, error: 'User ID is required' };
  }

  const payload = {
    user_id: userId,
    title_ct: ciphertexts.title_ct,
    url_ct: ciphertexts.url_ct || '',
    username_ct: ciphertexts.username_ct,
    password_ct: ciphertexts.password_ct,
    notes_ct: ciphertexts.notes_ct || '',
    ivs,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('credentials').insert(payload).select().single();
  if (error) {
    return { data: null, error: error.message };
  }
  return { data: data as RawCredentialRow, error: null };
}

export async function updateCredentialRecord(
  credentialId: string,
  ciphertexts: Record<string, string>,
  ivs: Record<string, string>
): Promise<ServiceResult<RawCredentialRow>> {
  if (!credentialId) {
    return { data: null, error: 'Credential ID is required' };
  }

  const payload = {
    title_ct: ciphertexts.title_ct,
    url_ct: ciphertexts.url_ct || '',
    username_ct: ciphertexts.username_ct,
    password_ct: ciphertexts.password_ct,
    notes_ct: ciphertexts.notes_ct || '',
    ivs,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('credentials')
    .update(payload)
    .eq('id', credentialId)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }
  return { data: data as RawCredentialRow, error: null };
}

export async function deleteCredentialRecord(credentialId: string): Promise<ServiceResult<boolean>> {
  if (!credentialId) {
    return { data: false, error: 'Credential ID is required' };
  }

  const { error } = await supabase.from('credentials').delete().eq('id', credentialId);
  if (error) {
    return { data: false, error: error.message };
  }
  return { data: true, error: null };
}
