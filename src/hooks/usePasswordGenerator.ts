import { useState, useCallback, useMemo } from 'react';
import { GeneratorConfig, PasswordStrength } from '../types/generator';

const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

const DEFAULT_CONFIG: GeneratorConfig = {
  length: 16,
  hasUpper: true,
  hasLower: true,
  hasNumbers: true,
  hasSymbols: true,
};

export function secureRandomInt(max: number): number {
  if (!Number.isInteger(max) || max <= 0) {
    throw new Error('max must be a positive integer');
  }

  const range = 0x1_0000_0000;
  const limit = Math.floor(range / max) * max;
  const buffer = new Uint32Array(1);
  let value: number;

  do {
    globalThis.crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);

  return value % max;
}

function randomChar(pool: string): string {
  return pool[secureRandomInt(pool.length)];
}

export function generatePassword(config: GeneratorConfig): string {
  const selectedPools: string[] = [];

  if (config.hasUpper) selectedPools.push(UPPERCASE_CHARS);
  if (config.hasLower) selectedPools.push(LOWERCASE_CHARS);
  if (config.hasNumbers) selectedPools.push(NUMBER_CHARS);
  if (config.hasSymbols) selectedPools.push(SYMBOL_CHARS);

  if (selectedPools.length === 0) selectedPools.push(LOWERCASE_CHARS);

  const characterPool = selectedPools.join('');
  const targetLength = Math.max(config.length, selectedPools.length);
  const characters = selectedPools.map(randomChar);

  while (characters.length < targetLength) {
    characters.push(randomChar(characterPool));
  }

  for (let index = characters.length - 1; index > 0; index--) {
    const targetIndex = secureRandomInt(index + 1);
    const temporary = characters[index];
    characters[index] = characters[targetIndex];
    characters[targetIndex] = temporary;
  }

  return characters.slice(0, targetLength).join('');
}

export function calculateEntropyBits(password: string): number {
  if (!password) return 0;

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += LOWERCASE_CHARS.length;
  if (/[A-Z]/.test(password)) poolSize += UPPERCASE_CHARS.length;
  if (/[0-9]/.test(password)) poolSize += NUMBER_CHARS.length;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += SYMBOL_CHARS.length;

  return password.length * Math.log2(Math.max(poolSize, 1));
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  const entropyBits = calculateEntropyBits(password);
  if (entropyBits < 50) return 'weak';
  if (entropyBits < 80) return 'medium';
  return 'strong';
}

export function usePasswordGenerator() {
  const [config, setConfig] = useState<GeneratorConfig>(DEFAULT_CONFIG);
  const [generation, setGeneration] = useState(0);

  const generatedPassword = useMemo(
    () => generatePassword(config),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config, generation]
  );

  const strength = useMemo(() => calculatePasswordStrength(generatedPassword), [generatedPassword]);
  const entropyBits = useMemo(() => calculateEntropyBits(generatedPassword), [generatedPassword]);

  const regeneratePassword = useCallback(() => {
    setGeneration((value) => value + 1);
  }, []);

  const updateConfig = useCallback((partial: Partial<GeneratorConfig>) => {
    setConfig((previous) => ({ ...previous, ...partial }));
  }, []);

  return {
    config,
    generatedPassword,
    strength,
    entropyBits,
    regeneratePassword,
    updateConfig,
  };
}
