import { describe, expect, it } from 'vitest';
import {
  getPinLockRemainingMs,
  isPinExpired,
  readPinAttempts,
  readStoredPin,
  recordFailedPinAttempt,
  removeLegacyPinStorage,
  removeStoredPin,
  writePinAttempts,
  writeStoredPin,
} from './pinStorage';
import { PIN_EXPIRY_MS, PIN_FORMAT_VERSION, PIN_MAX_ATTEMPTS } from '../constants/cryptoConstants';
import { StoredPinData } from '../types/vault';

const BASE_PAYLOAD: StoredPinData = {
  salt: 'aa',
  ct: 'bb',
  iv: 'cc',
  iterations: 1_000,
  version: PIN_FORMAT_VERSION,
  createdAt: Date.now(),
};

describe('pinStorage', () => {
  it('round-trips a valid payload', () => {
    writeStoredPin('user-1', BASE_PAYLOAD);
    expect(readStoredPin('user-1')).toEqual(BASE_PAYLOAD);
  });

  it('ignores corrupt JSON instead of crashing', () => {
    localStorage.setItem('fortress_pin:user-2', '{not-json');
    expect(readStoredPin('user-2')).toBeNull();
  });

  it('discards legacy PIN formats', () => {
    writeStoredPin('user-3', { ...BASE_PAYLOAD, version: 1 });
    expect(readStoredPin('user-3')).toBeNull();
  });

  it('discards expired PINs', () => {
    const expired = { ...BASE_PAYLOAD, createdAt: Date.now() - PIN_EXPIRY_MS - 1 };
    writeStoredPin('user-4', expired);
    expect(isPinExpired(expired)).toBe(true);
    expect(readStoredPin('user-4')).toBeNull();
  });

  it('keeps PINs isolated per user', () => {
    writeStoredPin('user-a', BASE_PAYLOAD);
    expect(readStoredPin('user-b')).toBeNull();
    removeStoredPin('user-a');
    expect(readStoredPin('user-a')).toBeNull();
  });

  it('removes the legacy global PIN payload', () => {
    localStorage.setItem('fortress_encrypted_pin', '{"salt":"aa","ct":"bb","iv":"cc"}');
    removeLegacyPinStorage();
    expect(localStorage.getItem('fortress_encrypted_pin')).toBeNull();
  });

  it('does not lock before the maximum number of attempts', () => {
    let state = { failedAttempts: 0, lockedUntil: 0 };
    for (let attempt = 1; attempt < PIN_MAX_ATTEMPTS; attempt++) {
      state = recordFailedPinAttempt(state);
      expect(state.failedAttempts).toBe(attempt);
      expect(state.lockedUntil).toBe(0);
    }
  });

  it('locks after the maximum number of attempts and backs off', () => {
    let state = { failedAttempts: 0, lockedUntil: 0 };
    for (let attempt = 0; attempt < PIN_MAX_ATTEMPTS; attempt++) {
      state = recordFailedPinAttempt(state);
    }

    expect(state.failedAttempts).toBe(PIN_MAX_ATTEMPTS);
    expect(getPinLockRemainingMs(state)).toBeGreaterThan(0);

    const next = recordFailedPinAttempt(state);
    expect(next.lockedUntil).toBeGreaterThan(state.lockedUntil);
  });

  it('clears an expired lockout when reading attempts', () => {
    writePinAttempts('user-5', { failedAttempts: PIN_MAX_ATTEMPTS, lockedUntil: Date.now() - 1 });
    expect(readPinAttempts('user-5')).toEqual({
      failedAttempts: PIN_MAX_ATTEMPTS,
      lockedUntil: 0,
    });
  });
});
