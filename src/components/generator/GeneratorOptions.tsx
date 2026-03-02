import { Minus, Plus } from 'lucide-react';
import { GeneratorConfig } from '../../types/generator';

interface GeneratorOptionsProps {
  readonly config: GeneratorConfig;
  readonly onUpdateConfig: (partial: Partial<GeneratorConfig>) => void;
}

export function GeneratorOptions({ config, onUpdateConfig }: GeneratorOptionsProps) {
  const handleLengthStep = (delta: number) => {
    const next = Math.min(64, Math.max(8, config.length + delta));
    onUpdateConfig({ length: next });
  };

  return (
    <section className="fw-card fw-card-pad">
      <div>
        <h2 className="text-base font-semibold tracking-[-0.015em] text-ink">
          Generation settings
        </h2>
        <p className="text-xs text-muted mt-0.5">Adjust length and character sets.</p>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <label className="fw-label" htmlFor="generator-length">
            Length
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleLengthStep(-1)}
              disabled={config.length <= 8}
              aria-label="Decrease length"
              className="flex h-6 w-6 items-center justify-center rounded-full border border-hairline bg-surface-subtle text-muted hover:text-ink disabled:opacity-30"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="fw-mono w-10 text-center text-xs font-semibold text-ink">
              {config.length}
            </span>
            <button
              type="button"
              onClick={() => handleLengthStep(1)}
              disabled={config.length >= 64}
              aria-label="Increase length"
              className="flex h-6 w-6 items-center justify-center rounded-full border border-hairline bg-surface-subtle text-muted hover:text-ink disabled:opacity-30"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="mt-3">
          <input
            id="generator-length"
            type="range"
            min={8}
            max={64}
            value={config.length}
            onChange={(event) => onUpdateConfig({ length: Number(event.target.value) })}
            className="fw-range"
          />
          <div className="mt-1 flex justify-between text-xs text-subtle font-mono">
            <span>8</span>
            <span>24</span>
            <span>40</span>
            <span>64</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <label className="fw-option">
          <input
            type="checkbox"
            checked={config.hasUpper}
            onChange={(event) => onUpdateConfig({ hasUpper: event.target.checked })}
            className="fw-checkbox"
          />
          <span className="text-sm font-medium">Uppercase (A-Z)</span>
        </label>
        <label className="fw-option">
          <input
            type="checkbox"
            checked={config.hasLower}
            onChange={(event) => onUpdateConfig({ hasLower: event.target.checked })}
            className="fw-checkbox"
          />
          <span className="text-sm font-medium">Lowercase (a-z)</span>
        </label>
        <label className="fw-option">
          <input
            type="checkbox"
            checked={config.hasNumbers}
            onChange={(event) => onUpdateConfig({ hasNumbers: event.target.checked })}
            className="fw-checkbox"
          />
          <span className="text-sm font-medium">Numbers (0-9)</span>
        </label>
        <label className="fw-option">
          <input
            type="checkbox"
            checked={config.hasSymbols}
            onChange={(event) => onUpdateConfig({ hasSymbols: event.target.checked })}
            className="fw-checkbox"
          />
          <span className="text-sm font-medium">Symbols (!@#$%^&*)</span>
        </label>
      </div>
    </section>
  );
}
