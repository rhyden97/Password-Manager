export const PBKDF2_ITERATIONS = 600_000;
export const LEGACY_PBKDF2_ITERATIONS = 100_000;
export const PIN_PBKDF2_ITERATIONS = 600_000;
export const PBKDF2_HASH = 'SHA-256';
export const AES_ALGORITHM = 'AES-GCM';
export const AES_KEY_LENGTH = 256;
export const SALT_BYTE_LENGTH = 16;
export const IV_BYTE_LENGTH = 12;
export const VALIDATION_SECRET_TEXT = 'fortress-vault-unlocked';

export const MASTER_PASSWORD_MIN_LENGTH = 12;
export const ACCOUNT_PASSWORD_MIN_LENGTH = 12;

export const PIN_MIN_LENGTH = 4;
export const PIN_MAX_LENGTH = 32;
export const PIN_FORMAT_VERSION = 2;
export const PIN_EXPIRY_DAYS = 30;
export const PIN_EXPIRY_MS = PIN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
export const PIN_MAX_ATTEMPTS = 5;
export const PIN_LOCKOUT_BASE_MS = 30_000;
export const PIN_LOCKOUT_MAX_MS = 15 * 60_000;
export const MAX_IMPORT_BYTES = 256 * 1024;
