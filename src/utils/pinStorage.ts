import {
  PIN_EXPIRY_MS,
  PIN_FORMAT_VERSION,
  PIN_LOCKOUT_BASE_MS,
  PIN_LOCKOUT_MAX_MS,
  PIN_MAX_ATTEMPTS,
} from '../constants/cryptoConstants';
import { PinAttemptState, StoredPinData } from '../types/vault';
import { safeGetItem, safeJsonParse, safeRemoveItem, safeSetItem } from './storage';

const PIN_KEY_PREFIX = 'fortress_pin:';
const PIN_ATTEMPTS_KEY_PREFIX = 'fortress_pin_attempts:';
const LEGACY_PIN_STORAGE_KEY = 'fortress_encrypted_pin';

export function removeLegacyPinStorage(): void {
  safeRemoveItem(LEGACY_PIN_STORAGE_KEY);
}

function pinKey(userId: string): string {
  return `${PIN_KEY_PREFIX}${userId}`;
}

function attemptsKey(userId: string): string {
  return `${PIN_ATTEMPTS_KEY_PREFIX}${userId}`;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isStoredPinData(value: unknown): value is StoredPinData {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    isNonEmptyString(candidate.salt) &&
    isNonEmptyString(candidate.ct) &&
    isNonEmptyString(candidate.iv) &&
    typeof candidate.iterations === 'number' &&
    Number.isInteger(candidate.iterations) &&
    candidate.iterations > 0 &&
    typeof candidate.version === 'number' &&
    typeof candidate.createdAt === 'number'
  );
}

function isPinAttemptState(value: unknown): value is PinAttemptState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.failedAttempts === 'number' &&
    Number.isInteger(candidate.failedAttempts) &&
    candidate.failedAttempts >= 0 &&
    typeof candidate.lockedUntil === 'number' &&
    candidate.lockedUntil >= 0
  );
}

export function isPinExpired(payload: StoredPinData): boolean {
  return Date.now() - payload.createdAt > PIN_EXPIRY_MS;
}

export function readStoredPin(userId: string): StoredPinData | null {
  if (!userId) return null;
  const parsed = safeJsonParse<unknown>(safeGetItem(pinKey(userId)));
  if (!isStoredPinData(parsed)) {
    if (parsed !== null) safeRemoveItem(pinKey(userId));
    return null;
  }
  if (parsed.version !== PIN_FORMAT_VERSION || isPinExpired(parsed)) {
    safeRemoveItem(pinKey(userId));
    return null;
  }
  return parsed;
}

export function writeStoredPin(userId: string, payload: StoredPinData): boolean {
  if (!userId) return false;
  return safeSetItem(pinKey(userId), JSON.stringify(payload));
}

export function removeStoredPin(userId: string): void {
  if (!userId) return;
  safeRemoveItem(pinKey(userId));
}

export function readPinAttempts(userId: string): PinAttemptState {
  const empty: PinAttemptState = { failedAttempts: 0, lockedUntil: 0 };
  if (!userId) return empty;
  const parsed = safeJsonParse<unknown>(safeGetItem(attemptsKey(userId)));
  if (!isPinAttemptState(parsed)) {
    if (parsed !== null) safeRemoveItem(attemptsKey(userId));
    return empty;
  }
  if (parsed.lockedUntil > 0 && parsed.lockedUntil <= Date.now()) {
    return { failedAttempts: parsed.failedAttempts, lockedUntil: 0 };
  }
  return parsed;
}

export function writePinAttempts(userId: string, state: PinAttemptState): void {
  if (!userId) return;
  safeSetItem(attemptsKey(userId), JSON.stringify(state));
}

export function removePinAttempts(userId: string): void {
  if (!userId) return;
  safeRemoveItem(attemptsKey(userId));
}

export function getPinLockRemainingMs(state: PinAttemptState): number {
  return Math.max(0, state.lockedUntil - Date.now());
}

export function formatPinLockRemaining(milliseconds: number): string {
  const seconds = Math.ceil(Math.max(0, milliseconds) / 1000);
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} min`;
}

export function recordFailedPinAttempt(state: PinAttemptState): PinAttemptState {
  const failedAttempts = state.failedAttempts + 1;
  if (failedAttempts < PIN_MAX_ATTEMPTS) {
    return { failedAttempts, lockedUntil: 0 };
  }
  const exponent = failedAttempts - PIN_MAX_ATTEMPTS;
  const delay = Math.min(PIN_LOCKOUT_BASE_MS * 2 ** exponent, PIN_LOCKOUT_MAX_MS);
  return { failedAttempts, lockedUntil: Date.now() + delay };
}
