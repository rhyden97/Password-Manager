import { supabase } from './supabase';
import { decryptFields, encryptFields } from '../utils/crypto';
import { fetchRawCredentials } from './credentialService';
import { fetchRawSecurityCodes } from './securityCodeService';
import { fetchRawApiKeys } from './apiKeyService';
import { ServiceResult } from './vaultService';

const CREDENTIAL_FIELDS = ['title', 'url', 'username', 'password', 'notes'] as const;
const SECURITY_CODE_FIELDS = ['title', 'codes', 'file_name', 'file_type'] as const;
const API_KEY_FIELDS = ['name', 'key', 'environment', 'scopes', 'expires_at', 'notes'] as const;

export async function reencryptVaultData(
  userId: string,
  oldKey: CryptoKey,
  newKey: CryptoKey,
  newSalt: string,
  newValIv: string,
  newValCt: string,
  newKdfIterations: number
): Promise<ServiceResult<boolean>> {
  if (!userId) {
    return { data: false, error: 'User ID is required' };
  }

  const [credentialsResult, securityCodesResult, apiKeysResult] = await Promise.all([
    fetchRawCredentials(userId),
    fetchRawSecurityCodes(userId),
    fetchRawApiKeys(userId),
  ]);

  const fetchError =
    credentialsResult.error || securityCodesResult.error || apiKeysResult.error;
  if (
    fetchError ||
    !credentialsResult.data ||
    !securityCodesResult.data ||
    !apiKeysResult.data
  ) {
    return { data: false, error: fetchError || 'Failed to read vault data' };
  }

  try {
    const credentials = await Promise.all(
      credentialsResult.data.map(async (row) => {
        const fields = await decryptFields<Record<string, string>>(
          row as unknown as Record<string, unknown>,
          CREDENTIAL_FIELDS,
          oldKey
        );
        const { ciphertexts, ivs } = await encryptFields(fields, CREDENTIAL_FIELDS, newKey);
        return {
          id: row.id,
          title_ct: ciphertexts.title_ct,
          url_ct: ciphertexts.url_ct,
          username_ct: ciphertexts.username_ct,
          password_ct: ciphertexts.password_ct,
          notes_ct: ciphertexts.notes_ct,
          ivs,
        };
      })
    );

    const securityCodes = await Promise.all(
      securityCodesResult.data.map(async (row) => {
        const fields = await decryptFields<Record<string, string>>(
          row as unknown as Record<string, unknown>,
          SECURITY_CODE_FIELDS,
          oldKey
        );
        const { ciphertexts, ivs } = await encryptFields(
          fields,
          SECURITY_CODE_FIELDS,
          newKey
        );
        return {
          id: row.id,
          title_ct: ciphertexts.title_ct,
          codes_ct: ciphertexts.codes_ct,
          file_name_ct: ciphertexts.file_name_ct,
          file_type_ct: ciphertexts.file_type_ct,
          ivs,
        };
      })
    );

    const apiKeys = await Promise.all(
      apiKeysResult.data.map(async (row) => {
        const fields = await decryptFields<Record<string, string>>(
          row as unknown as Record<string, unknown>,
          API_KEY_FIELDS,
          oldKey
        );
        const { ciphertexts, ivs } = await encryptFields(fields, API_KEY_FIELDS, newKey);
        return {
          id: row.id,
          name_ct: ciphertexts.name_ct,
          key_ct: ciphertexts.key_ct,
          environment_ct: ciphertexts.environment_ct,
          scopes_ct: ciphertexts.scopes_ct,
          expires_at_ct: ciphertexts.expires_at_ct,
          notes_ct: ciphertexts.notes_ct,
          ivs,
        };
      })
    );

    const { error } = await supabase.rpc('reencrypt_vault', {
      p_salt: newSalt,
      p_val_iv: newValIv,
      p_val_ct: newValCt,
      p_kdf_iterations: newKdfIterations,
      p_credentials: credentials,
      p_security_codes: securityCodes,
      p_api_keys: apiKeys,
    });

    if (error) {
      return { data: false, error: error.message };
    }

    return { data: true, error: null };
  } catch (error) {
    return {
      data: false,
      error: error instanceof Error ? error.message : 'Failed to re-encrypt vault',
    };
  }
}
