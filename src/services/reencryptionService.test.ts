import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  decryptFields,
  deriveKey,
  encryptFields,
  generateSalt,
} from '../utils/crypto';
import { reencryptVaultData } from './reencryptionService';
import { supabase } from './supabase';
import { fetchRawCredentials } from './credentialService';
import { fetchRawSecurityCodes } from './securityCodeService';
import { fetchRawApiKeys } from './apiKeyService';
import type { RawCredentialRow } from './credentialService';
import type { RawSecurityCodeRow } from './securityCodeService';
import type { RawApiKeyRow } from './apiKeyService';

vi.mock('./supabase', () => ({ supabase: { rpc: vi.fn() } }));
vi.mock('./credentialService', () => ({ fetchRawCredentials: vi.fn() }));
vi.mock('./securityCodeService', () => ({ fetchRawSecurityCodes: vi.fn() }));
vi.mock('./apiKeyService', () => ({ fetchRawApiKeys: vi.fn() }));

const CREDENTIAL_FIELDS = ['title', 'url', 'username', 'password', 'notes'] as const;
const SECURITY_CODE_FIELDS = ['title', 'codes', 'file_name', 'file_type'] as const;
const API_KEY_FIELDS = ['name', 'key', 'environment', 'scopes', 'expires_at', 'notes'] as const;

const USER_ID = '11111111-1111-4111-8111-111111111111';
const MASTER_PASSWORD = 'correct horse battery staple';

async function buildFixture() {
  const oldSalt = generateSalt();
  const newSalt = generateSalt();
  const oldKey = await deriveKey(MASTER_PASSWORD, oldSalt, 100_000);
  const newKey = await deriveKey(MASTER_PASSWORD, newSalt, 600_000);

  const credentialPlain = {
    title: 'GitHub',
    url: 'https://github.com',
    username: 'octocat',
    password: 's3cret',
    notes: 'work account',
  };
  const credentialEncrypted = await encryptFields(
    credentialPlain,
    CREDENTIAL_FIELDS,
    oldKey
  );
  const credentialRow: RawCredentialRow = {
    id: '22222222-2222-4222-8222-222222222222',
    user_id: USER_ID,
    title_ct: credentialEncrypted.ciphertexts.title_ct,
    url_ct: credentialEncrypted.ciphertexts.url_ct,
    username_ct: credentialEncrypted.ciphertexts.username_ct,
    password_ct: credentialEncrypted.ciphertexts.password_ct,
    notes_ct: credentialEncrypted.ciphertexts.notes_ct,
    ivs: credentialEncrypted.ivs,
  };

  const securityCodePlain = {
    title: 'GitHub 2FA',
    codes: 'AAAA-BBBB\nCCCC-DDDD',
    file_name: 'codes.txt',
    file_type: 'text/plain',
  };
  const securityCodeEncrypted = await encryptFields(
    securityCodePlain,
    SECURITY_CODE_FIELDS,
    oldKey
  );
  const securityCodeRow: RawSecurityCodeRow = {
    id: '33333333-3333-4333-8333-333333333333',
    user_id: USER_ID,
    title_ct: securityCodeEncrypted.ciphertexts.title_ct,
    codes_ct: securityCodeEncrypted.ciphertexts.codes_ct,
    file_name_ct: securityCodeEncrypted.ciphertexts.file_name_ct,
    file_type_ct: securityCodeEncrypted.ciphertexts.file_type_ct,
    ivs: securityCodeEncrypted.ivs,
  };

  const apiKeyPlain = {
    name: 'OpenAI',
    key: 'sk-test-key',
    environment: 'production',
    scopes: 'read, write',
    expires_at: '2027-01-01',
    notes: 'billing project',
  };
  const apiKeyEncrypted = await encryptFields(apiKeyPlain, API_KEY_FIELDS, oldKey);
  const apiKeyRow: RawApiKeyRow = {
    id: '44444444-4444-4444-8444-444444444444',
    user_id: USER_ID,
    name_ct: apiKeyEncrypted.ciphertexts.name_ct,
    key_ct: apiKeyEncrypted.ciphertexts.key_ct,
    environment_ct: apiKeyEncrypted.ciphertexts.environment_ct,
    scopes_ct: apiKeyEncrypted.ciphertexts.scopes_ct,
    expires_at_ct: apiKeyEncrypted.ciphertexts.expires_at_ct,
    notes_ct: apiKeyEncrypted.ciphertexts.notes_ct,
    ivs: apiKeyEncrypted.ivs,
  };

  return {
    oldKey,
    newKey,
    newSalt,
    credentialRow,
    securityCodeRow,
    apiKeyRow,
    credentialPlain,
    securityCodePlain,
    apiKeyPlain,
  };
}

describe('reencryptVaultData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('decrypts with the old key, encrypts with the new key, and calls the RPC once', async () => {
    const fixture = await buildFixture();
    vi.mocked(fetchRawCredentials).mockResolvedValue({
      data: [fixture.credentialRow],
      error: null,
    });
    vi.mocked(fetchRawSecurityCodes).mockResolvedValue({
      data: [fixture.securityCodeRow],
      error: null,
    });
    vi.mocked(fetchRawApiKeys).mockResolvedValue({
      data: [fixture.apiKeyRow],
      error: null,
    });
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null } as never);

    const result = await reencryptVaultData(
      USER_ID,
      fixture.oldKey,
      fixture.newKey,
      fixture.newSalt,
      'new-val-iv',
      'new-val-ct',
      600_000
    );

    expect(result).toEqual({ data: true, error: null });
    expect(supabase.rpc).toHaveBeenCalledTimes(1);

    const [functionName, args] = vi.mocked(supabase.rpc).mock.calls[0];
    expect(functionName).toBe('reencrypt_vault');
    const payload = args as {
      p_salt: string;
      p_val_iv: string;
      p_val_ct: string;
      p_kdf_iterations: number;
      p_credentials: Array<Record<string, unknown>>;
      p_security_codes: Array<Record<string, unknown>>;
      p_api_keys: Array<Record<string, unknown>>;
    };

    expect(payload.p_salt).toBe(fixture.newSalt);
    expect(payload.p_val_iv).toBe('new-val-iv');
    expect(payload.p_val_ct).toBe('new-val-ct');
    expect(payload.p_kdf_iterations).toBe(600_000);

    const decryptedCredential = await decryptFields<Record<string, string>>(
      payload.p_credentials[0],
      CREDENTIAL_FIELDS,
      fixture.newKey
    );
    expect(decryptedCredential).toEqual(fixture.credentialPlain);

    const decryptedSecurityCode = await decryptFields<Record<string, string>>(
      payload.p_security_codes[0],
      SECURITY_CODE_FIELDS,
      fixture.newKey
    );
    expect(decryptedSecurityCode).toEqual(fixture.securityCodePlain);

    const decryptedApiKey = await decryptFields<Record<string, string>>(
      payload.p_api_keys[0],
      API_KEY_FIELDS,
      fixture.newKey
    );
    expect(decryptedApiKey).toEqual(fixture.apiKeyPlain);
  });

  it('does not call the RPC when a table cannot be read', async () => {
    vi.mocked(fetchRawCredentials).mockResolvedValue({ data: null, error: 'read failed' });
    vi.mocked(fetchRawSecurityCodes).mockResolvedValue({ data: [], error: null });
    vi.mocked(fetchRawApiKeys).mockResolvedValue({ data: [], error: null });

    const result = await reencryptVaultData(
      USER_ID,
      {} as CryptoKey,
      {} as CryptoKey,
      'salt',
      'iv',
      'ct',
      600_000
    );

    expect(result).toEqual({ data: false, error: 'read failed' });
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it('does not call the RPC when any row cannot be decrypted', async () => {
    const fixture = await buildFixture();
    vi.mocked(fetchRawCredentials).mockResolvedValue({
      data: [{ ...fixture.credentialRow, password_ct: 'not-hex' }],
      error: null,
    });
    vi.mocked(fetchRawSecurityCodes).mockResolvedValue({ data: [], error: null });
    vi.mocked(fetchRawApiKeys).mockResolvedValue({ data: [], error: null });

    const result = await reencryptVaultData(
      USER_ID,
      fixture.oldKey,
      fixture.newKey,
      fixture.newSalt,
      'iv',
      'ct',
      600_000
    );

    expect(result.data).toBe(false);
    expect(result.error).toBeTruthy();
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
