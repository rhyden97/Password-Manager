import { describe, expect, it } from 'vitest';
import {
  decryptMasterKeyWithPin,
  decryptText,
  deriveKey,
  encryptMasterKeyWithPin,
  encryptText,
  generateSalt,
  generateValidation,
  hexToBuffer,
  verifyValidation,
} from './crypto';

const TEST_ITERATIONS = 1_000;

describe('crypto', () => {
  it('round-trips an encrypted field', async () => {
    const salt = generateSalt();
    const key = await deriveKey('correct horse battery staple', salt, TEST_ITERATIONS);
    const { ct, iv } = await encryptText('super-secret-value', key);

    expect(ct).not.toBe('super-secret-value');
    expect(iv).toHaveLength(24);
    await expect(decryptText(ct, iv, key)).resolves.toBe('super-secret-value');
  });

  it('uses a fresh IV for every encryption', async () => {
    const salt = generateSalt();
    const key = await deriveKey('same-password', salt, TEST_ITERATIONS);
    const first = await encryptText('same plaintext', key);
    const second = await encryptText('same plaintext', key);

    expect(first.iv).not.toBe(second.iv);
    expect(first.ct).not.toBe(second.ct);
  });

  it('fails to decrypt with a different key', async () => {
    const salt = generateSalt();
    const key = await deriveKey('password-one', salt, TEST_ITERATIONS);
    const wrongKey = await deriveKey('password-two', salt, TEST_ITERATIONS);
    const { ct, iv } = await encryptText('protected', key);

    await expect(decryptText(ct, iv, wrongKey)).rejects.toThrow();
  });

  it('rejects malformed hexadecimal input', () => {
    expect(() => hexToBuffer('')).toThrow('Invalid hexadecimal string');
    expect(() => hexToBuffer('abc')).toThrow('Invalid hexadecimal string');
    expect(() => hexToBuffer('zz')).toThrow('Invalid hexadecimal string');
    expect(() => hexToBuffer('00 11')).toThrow('Invalid hexadecimal string');
  });

  it('verifies the vault validation token', async () => {
    const salt = generateSalt();
    const key = await deriveKey('master-password', salt, TEST_ITERATIONS);
    const validation = await generateValidation(key);
    const wrongKey = await deriveKey('other-password', salt, TEST_ITERATIONS);

    await expect(verifyValidation(validation.val_ct, validation.val_iv, key)).resolves.toBe(true);
    await expect(
      verifyValidation(validation.val_ct, validation.val_iv, wrongKey)
    ).resolves.toBe(false);
  });

  it('wraps and unwraps the master password with a PIN', async () => {
    const payload = await encryptMasterKeyWithPin('master-password', '123456', TEST_ITERATIONS);

    expect(payload.iterations).toBe(TEST_ITERATIONS);
    expect(payload.version).toBe(2);
    await expect(decryptMasterKeyWithPin(payload, '123456')).resolves.toBe('master-password');
    await expect(decryptMasterKeyWithPin(payload, '654321')).resolves.toBeNull();
  });
});
