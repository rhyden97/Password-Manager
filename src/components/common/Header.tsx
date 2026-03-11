import { Lock, LogOut } from 'lucide-react';
import type { ActiveTab } from '../../types/vault';
import { IconButton } from '../ui/IconButton';
import { ThemeToggle } from './ThemeToggle';
import { NAVIGATION_CONFIG, NAVIGATION_TABS } from './navigation';

interface HeaderProps {
  readonly userEmail?: string;
  readonly activeTab: ActiveTab;
  readonly onChangeTab: (tab: ActiveTab) => void;
  readonly onLockVault: () => void;
  readonly onSignOut: () => void;
}

export function Header({
  activeTab,
  onChangeTab,
  onLockVault,
  onSignOut,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40">
      <div className="h-11 bg-black text-white/80 border-b border-white/10 select-none">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-3 px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full bg-white/5 px-2 py-0.5 text-xs font-medium text-white/60 sm:inline-flex ring-1 ring-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              Secure session
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <ThemeToggle onDark />
            <IconButton label="Lock vault" size="small" onDark onClick={onLockVault}>
              <Lock className="h-4 w-4" />
            </IconButton>
            <IconButton label="Sign out" size="small" onDark onClick={onSignOut}>
              <LogOut className="h-4 w-4" />
            </IconButton>
          </div>
        </div>
      </div>

      <div className="hidden border-b border-hairline bg-canvas/80 backdrop-blur-xl md:block">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex h-13 max-w-6xl items-center justify-between gap-4 px-4 md:px-8"
        >
          <span className="text-base font-semibold tracking-wider text-ink">
            FORTRESS
          </span>

          <div className="flex items-center gap-1">
            {NAVIGATION_TABS.map((tab) => {
              const config = NAVIGATION_CONFIG[tab];
              const Icon = config.icon;
              const isSelected = activeTab === tab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => onChangeTab(tab)}
                  aria-current={isSelected ? 'page' : undefined}
                  className={`fw-nav-tab ${
                    isSelected ? 'bg-surface shadow-2xs text-ink' : ''
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
