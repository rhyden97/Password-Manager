import type { ActiveTab } from '../../types/vault';
import { NAVIGATION_CONFIG, NAVIGATION_TABS } from './navigation';

interface BottomNavProps {
  readonly activeTab: ActiveTab;
  readonly onChangeTab: (tab: ActiveTab) => void;
}

export function BottomNav({ activeTab, onChangeTab }: BottomNavProps) {
  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-canvas/80 backdrop-blur-2xl md:hidden shadow-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-1">
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
              className={`flex min-h-12.5 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-xs font-semibold tracking-tight transition-all active:scale-92 ${
                isSelected
                  ? 'text-primary font-bold'
                  : 'text-muted/80 hover:text-ink'
              }`}
            >
              <div className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                isSelected ? 'bg-primary/10' : ''
              }`}>
                <Icon className={`h-4.5 w-4.5 transition-transform ${isSelected ? 'scale-110 text-primary' : ''}`} aria-hidden="true" />
              </div>
              <span className="max-w-full truncate text-2xs leading-tight">{config.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
