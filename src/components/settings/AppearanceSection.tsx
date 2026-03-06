import { Check, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export function AppearanceSection() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <h3 className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted">
        Appearance
      </h3>
      <section className="rounded-2xl border border-hairline bg-surface p-4 shadow-2xs sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#5856d6] text-white shadow-2xs">
            {theme === 'dark' ? (
              <Moon className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Sun className="h-4 w-4" aria-hidden="true" />
            )}
          </div>
          <div>
            <span className="text-sm font-medium text-ink">Interface theme</span>
            <p className="text-xs text-muted">Choose your appearance</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3.5 border-t border-hairline pt-4 sm:gap-4">
          <button
            type="button"
            onClick={() => setTheme('light')}
            aria-pressed={theme === 'light'}
            className={`group flex flex-col items-center gap-2 rounded-xl p-2 transition-all text-left ${
              theme === 'light'
                ? 'ring-2 ring-primary bg-primary/5 shadow-xs'
                : 'border border-hairline hover:border-hairline-strong bg-surface-subtle/40'
            }`}
          >
            <div className="w-full h-20 rounded-lg border border-black/10 bg-[#f5f5f7] p-2 flex flex-col gap-1.5 shadow-2xs overflow-hidden">
              <div className="flex items-center gap-1 border-b border-black/5 pb-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff5f56]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#ffbd2e]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#27c93f]" />
              </div>
              <div className="flex-1 rounded-md bg-white p-1.5 border border-black/5 flex flex-col justify-between">
                <div className="h-1.5 w-10 rounded-full bg-[#1d1d1f]/20" />
                <div className="flex items-center justify-between">
                  <div className="h-1.5 w-6 rounded-full bg-black/10" />
                  <div className="h-2.5 w-6 rounded-full bg-[#0066cc]" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
              <span>Light</span>
              {theme === 'light' && <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            aria-pressed={theme === 'dark'}
            className={`group flex flex-col items-center gap-2 rounded-xl p-2 transition-all text-left ${
              theme === 'dark'
                ? 'ring-2 ring-primary bg-primary/5 shadow-xs'
                : 'border border-hairline hover:border-hairline-strong bg-surface-subtle/40'
            }`}
          >
            <div className="w-full h-20 rounded-lg border border-white/10 bg-[#000000] p-2 flex flex-col gap-1.5 shadow-2xs overflow-hidden">
              <div className="flex items-center gap-1 border-b border-white/10 pb-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff5f56]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#ffbd2e]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#27c93f]" />
              </div>
              <div className="flex-1 rounded-md bg-[#1c1c1e] p-1.5 border border-white/10 flex flex-col justify-between">
                <div className="h-1.5 w-10 rounded-full bg-white/30" />
                <div className="flex items-center justify-between">
                  <div className="h-1.5 w-6 rounded-full bg-white/15" />
                  <div className="h-2.5 w-6 rounded-full bg-[#0066cc]" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
              <span>Dark</span>
              {theme === 'dark' && <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />}
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}
