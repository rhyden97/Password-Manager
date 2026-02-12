export type AuthMode = 'login' | 'register';

export interface UserProfile {
  readonly id: string;
  readonly email: string;
}

export interface RememberedAuth {
  readonly email: string;
  readonly cipher: string;
  readonly iv: string;
  readonly salt: string;
}
