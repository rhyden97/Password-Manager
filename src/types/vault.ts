export type ActiveTab = 'passwords' | 'api_keys' | 'security_codes' | 'generator' | 'settings';

export type AutoLockTimeoutMinutes = '1' | '5' | '15' | '30' | 'never';

export interface VaultMetadata {
  readonly user_id: string;
  readonly salt: string;
  readonly val_iv: string;
  readonly val_ct: string;
  readonly kdf_iterations?: number | null;
  readonly updated_at?: string;
}

export interface StoredPinData {
  readonly salt: string;
  readonly ct: string;
  readonly iv: string;
  readonly iterations: number;
  readonly version: number;
  readonly createdAt: number;
}

export interface PinAttemptState {
  readonly failedAttempts: number;
  readonly lockedUntil: number;
}
