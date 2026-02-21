import { describe, expect, it } from 'vitest';
import {
  calculateEntropyBits,
  calculatePasswordStrength,
  generatePassword,
  secureRandomInt,
} from './usePasswordGenerator';

const ALL_CATEGORIES = {
  length: 24,
  hasUpper: true,
  hasLower: true,
  hasNumbers: true,
  hasSymbols: true,
} as const;

describe('password generator', () => {
  it('generates the requested length', () => {
    for (const length of [8, 16, 32, 64]) {
      expect(generatePassword({ ...ALL_CATEGORIES, length })).toHaveLength(length);
    }
  });

  it('includes at least one character from every selected category', () => {
    for (let iteration = 0; iteration < 50; iteration++) {
      const password = generatePassword(ALL_CATEGORIES);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[0-9]/);
      expect(password).toMatch(/[^a-zA-Z0-9]/);
    }
  });

  it('falls back to lowercase when no category is selected', () => {
    const password = generatePassword({
      length: 16,
      hasUpper: false,
      hasLower: false,
      hasNumbers: false,
      hasSymbols: false,
    });
    expect(password).toHaveLength(16);
    expect(password).toMatch(/^[a-z]+$/);
  });

  it('returns unbiased integers inside the requested range', () => {
    for (let iteration = 0; iteration < 1_000; iteration++) {
      const value = secureRandomInt(10);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(10);
    }
  });

  it('rejects invalid ranges', () => {
    expect(() => secureRandomInt(0)).toThrow();
    expect(() => secureRandomInt(-1)).toThrow();
    expect(() => secureRandomInt(1.5)).toThrow();
  });

  it('calculates entropy and strength from the real character pool', () => {
    expect(calculateEntropyBits('')).toBe(0);
    expect(calculateEntropyBits('aaaaaaaa')).toBeGreaterThan(0);
    expect(calculatePasswordStrength('aaaaaaaa')).toBe('weak');
    expect(calculatePasswordStrength(generatePassword(ALL_CATEGORIES))).toBe('strong');
  });
});
