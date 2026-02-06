import {
  PBKDF2_ITERATIONS,
  LEGACY_PBKDF2_ITERATIONS,
  PIN_PBKDF2_ITERATIONS,
  PIN_FORMAT_VERSION,
  PBKDF2_HASH,
  AES_ALGORITHM,
  AES_KEY_LENGTH,
  SALT_BYTE_LENGTH,
  IV_BYTE_LENGTH,
  VALIDATION_SECRET_TEXT,
} from '../constants/cryptoConstants';

export interface EncryptedFieldResult {
  readonly ct: string;
  readonly iv: string;
}

export interface PinEncryptedPayload {
  readonly salt: string;
  readonly ct: string;
  readonly iv: string;
  readonly iterations: number;
  readonly version: number;
  readonly createdAt: number;
}

export interface ValidationPayload {
  readonly val_iv: string;
  readonly val_ct: string;
}

export function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBuffer(hexString: string): ArrayBuffer {
  if (
    typeof hexString !== 'string' ||
    hexString.length === 0 ||
    hexString.length % 2 !== 0 ||
    !/^[0-9a-f]+$/i.test(hexString)
  ) {
    throw new Error('Invalid hexadecimal string');
  }
  const length = hexString.length / 2;
  const bytes = new Uint8Array(length);
  for (let index = 0; index < length; index++) {
    bytes[index] = parseInt(hexString.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes.buffer;
}

export async function deriveKey(
  password: string,
  saltHex: string,
  iterations: number = PBKDF2_ITERATIONS
): Promise<CryptoKey> {
  if (!password) {
    throw new Error('A non-empty password is required');
  }
  if (!Number.isInteger(iterations) || iterations < 1) {
    throw new Error('Invalid PBKDF2 iteration count');
  }

  const textEncoder = new TextEncoder();
  const passwordBuffer = textEncoder.encode(password);
  const saltBuffer = hexToBuffer(saltHex);

  const baseKey = await globalThis.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return await globalThis.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations,
      hash: PBKDF2_HASH,
    },
    baseKey,
    { name: AES_ALGORITHM, length: AES_KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

export function generateSalt(): string {
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(SALT_BYTE_LENGTH));
  return bufferToHex(salt.buffer);
}

export async function encryptText(text: string, key: CryptoKey): Promise<EncryptedFieldResult> {
  if (!text) {
    return { ct: '', iv: '' };
  }
  const textEncoder = new TextEncoder();
  const ivArray = globalThis.crypto.getRandomValues(new Uint8Array(IV_BYTE_LENGTH));
  const encryptedBuffer = await globalThis.crypto.subtle.encrypt(
    { name: AES_ALGORITHM, iv: ivArray },
    key,
    textEncoder.encode(text)
  );

  return {
    ct: bufferToHex(encryptedBuffer),
    iv: bufferToHex(ivArray.buffer),
  };
}

export async function decryptText(
  ciphertextHex: string,
  ivHex: string,
  key: CryptoKey
): Promise<string> {
  if (!ciphertextHex || !ivHex) {
    return '';
  }
  const textDecoder = new TextDecoder();
  const ciphertextBuffer = hexToBuffer(ciphertextHex);
  const ivBuffer = hexToBuffer(ivHex);

  const decryptedBuffer = await globalThis.crypto.subtle.decrypt(
    { name: AES_ALGORITHM, iv: ivBuffer },
    key,
    ciphertextBuffer
  );

  return textDecoder.decode(decryptedBuffer);
}

export async function encryptFields<T extends Record<string, string>>(
  inputData: T,
  fieldKeys: ReadonlyArray<keyof T & string>,
  key: CryptoKey
): Promise<{ ciphertexts: Record<string, string>; ivs: Record<string, string> }> {
  const ciphertexts: Record<string, string> = {};
  const ivs: Record<string, string> = {};

  for (const field of fieldKeys) {
    const textValue = inputData[field] || '';
    const { ct, iv } = await encryptText(textValue, key);
    ciphertexts[`${field}_ct`] = ct;
    ivs[field] = iv;
  }

  return { ciphertexts, ivs };
}

export async function decryptFields<T extends Record<string, string>>(
  dbRow: Record<string, unknown>,
  fieldKeys: ReadonlyArray<string>,
  key: CryptoKey
): Promise<T> {
  const decryptedResult: Record<string, string> = {};
  const ivs = (dbRow.ivs as Record<string, string> | undefined) ?? {};

  for (const field of fieldKeys) {
    const ciphertext = typeof dbRow[`${field}_ct`] === 'string' ? (dbRow[`${field}_ct`] as string) : '';
    const iv = typeof ivs[field] === 'string' ? ivs[field] : '';
    decryptedResult[field] = await decryptText(ciphertext, iv, key);
  }

  return decryptedResult as T;
}

export async function generateValidation(key: CryptoKey): Promise<ValidationPayload> {
  const { ct, iv } = await encryptText(VALIDATION_SECRET_TEXT, key);
  return { val_iv: iv, val_ct: ct };
}

export async function verifyValidation(
  valCt: string,
  valIv: string,
  key: CryptoKey
): Promise<boolean> {
  try {
    const decrypted = await decryptText(valCt, valIv, key);
    return decrypted === VALIDATION_SECRET_TEXT;
  } catch (error) {
    console.debug('Validation decryption failed:', error);
    return false;
  }
}

export async function encryptMasterKeyWithPin(
  masterPassword: string,
  pin: string,
  iterations: number = PIN_PBKDF2_ITERATIONS
): Promise<PinEncryptedPayload> {
  const salt = generateSalt();
  const pinKey = await deriveKey(pin, salt, iterations);
  const { ct, iv } = await encryptText(masterPassword, pinKey);
  return {
    salt,
    ct,
    iv,
    iterations,
    version: PIN_FORMAT_VERSION,
    createdAt: Date.now(),
  };
}

export async function decryptMasterKeyWithPin(
  payload: PinEncryptedPayload,
  pin: string
): Promise<string | null> {
  try {
    const iterations = payload.iterations > 0 ? payload.iterations : LEGACY_PBKDF2_ITERATIONS;
    const pinKey = await deriveKey(pin, payload.salt, iterations);
    const decrypted = await decryptText(payload.ct, payload.iv, pinKey);
    return decrypted;
  } catch (error) {
    console.debug('PIN unwrapping failed:', error);
    return null;
  }
}
