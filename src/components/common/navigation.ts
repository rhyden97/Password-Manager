import type { ComponentType } from 'react';
import { Key, KeyRound, RefreshCw, Settings, ShieldAlert } from 'lucide-react';
import type { ActiveTab } from '../../types/vault';

export interface NavItemConfig {
  readonly label: string;
  readonly shortLabel: string;
  readonly icon: ComponentType<{ className?: string }>;
}

export const NAVIGATION_CONFIG: Record<ActiveTab, NavItemConfig> = {
  passwords: { label: 'Passwords', shortLabel: 'Keys', icon: Key },
  api_keys: { label: 'API Keys', shortLabel: 'API', icon: KeyRound },
  security_codes: { label: '2FA Codes', shortLabel: '2FA', icon: ShieldAlert },
  generator: { label: 'Generator', shortLabel: 'Generate', icon: RefreshCw },
  settings: { label: 'Settings', shortLabel: 'Settings', icon: Settings },
};

export const NAVIGATION_TABS = Object.keys(NAVIGATION_CONFIG) as ActiveTab[];
