import { supabase } from './supabase';
import { ServiceResult } from './vaultService';

export interface RawSecurityCodeRow {
  readonly id: string;
  readonly user_id: string;
  readonly title_ct: string;
  readonly codes_ct: string;
  readonly file_name_ct?: string | null;
  readonly file_type_ct?: string | null;
  readonly ivs: Record<string, string>;
  readonly created_at?: string;
  readonly updated_at?: string;
}

export async function fetchRawSecurityCodes(userId: string): Promise<ServiceResult<RawSecurityCodeRow[]>> {
  if (!userId) {
    return { data: [], error: 'User ID is required' };
  }

  const { data, error } = await supabase
    .from('security_codes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: (data as RawSecurityCodeRow[]) ?? [], error: null };
}

export async function insertSecurityCodeRecord(
  userId: string,
  ciphertexts: Record<string, string>,
  ivs: Record<string, string>
): Promise<ServiceResult<RawSecurityCodeRow>> {
  if (!userId) {
    return { data: null, error: 'User ID is required' };
  }

  const payload = {
    user_id: userId,
    title_ct: ciphertexts.title_ct,
    codes_ct: ciphertexts.codes_ct,
    file_name_ct: ciphertexts.file_name_ct || '',
    file_type_ct: ciphertexts.file_type_ct || '',
    ivs,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('security_codes').insert(payload).select().single();
  if (error) {
    return { data: null, error: error.message };
  }
  return { data: data as RawSecurityCodeRow, error: null };
}

export async function updateSecurityCodeRecord(
  codeId: string,
  ciphertexts: Record<string, string>,
  ivs: Record<string, string>
): Promise<ServiceResult<RawSecurityCodeRow>> {
  if (!codeId) {
    return { data: null, error: 'Security code ID is required' };
  }

  const payload = {
    title_ct: ciphertexts.title_ct,
    codes_ct: ciphertexts.codes_ct,
    file_name_ct: ciphertexts.file_name_ct || '',
    file_type_ct: ciphertexts.file_type_ct || '',
    ivs,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('security_codes')
    .update(payload)
    .eq('id', codeId)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }
  return { data: data as RawSecurityCodeRow, error: null };
}

export async function deleteSecurityCodeRecord(codeId: string): Promise<ServiceResult<boolean>> {
  if (!codeId) {
    return { data: false, error: 'Security code ID is required' };
  }

  const { error } = await supabase.from('security_codes').delete().eq('id', codeId);
  if (error) {
    return { data: false, error: error.message };
  }
  return { data: true, error: null };
}
