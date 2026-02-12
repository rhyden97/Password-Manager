export interface GeneratorConfig {
  readonly length: number;
  readonly hasUpper: boolean;
  readonly hasLower: boolean;
  readonly hasNumbers: boolean;
  readonly hasSymbols: boolean;
}

export type PasswordStrength = 'weak' | 'medium' | 'strong';
