import { useState } from 'react';
import { Check, Copy, RefreshCw } from 'lucide-react';
import { PasswordStrength } from '../../types/generator';

interface GeneratorDisplayProps {
  readonly generatedPassword: string;
  readonly strength: PasswordStrength;
  readonly entropyBits: number;
  readonly onRegenerate: () => void;
  readonly onCopy: (text: string, label: string) => void;
}

const TIER_COLORS = [
  'bg-danger',
  'bg-warning',
  'bg-emerald-400',
  'bg-emerald-300 shadow-glow',
];

export function GeneratorDisplay({
  generatedPassword,
  strength,
  entropyBits,
  onRegenerate,
  onCopy,
}: GeneratorDisplayProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const handleCopy = () => {
    onCopy(generatedPassword, 'Generated password');
    setHasCopied(true);
    window.setTimeout(() => setHasCopied(false), 2000);
  };

  const handleRegenerate = () => {
    setIsRotating(true);
    onRegenerate();
    window.setTimeout(() => setIsRotating(false), 300);
  };

  const strengthTier =
    strength === 'weak' ? 1 : strength === 'medium' ? 2 : entropyBits >= 80 ? 4 : 3;

  const strengthLabel =
    strengthTier === 1
      ? 'Weak'
      : strengthTier === 2
        ? 'Medium'
        : strengthTier === 3
          ? 'Strong'
          : 'Maximum';

  return (
    <section className="fw-card p-6 sm:p-7 md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:px-5 rounded-xl border border-hairline bg-surface-subtle shadow-2xs">
            <p className="fw-mono min-w-0 flex-1 break-all text-xl leading-relaxed tracking-wider text-ink select-all sm:text-2xl md:text-3xl">
              {generatedPassword}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:self-auto">
          <button
            type="button"
            onClick={handleRegenerate}
            className="fw-btn fw-btn-ghost"
            aria-label="Generate password"
          >
            <RefreshCw
              className={`h-4 w-4 transition-transform duration-300 ${
                isRotating ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
            <span>Generate</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="fw-btn fw-btn-primary min-w-25"
          >
            {hasCopied ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden="true" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-6 border-t border-hairline pt-5">
        <div className="flex items-center justify-between text-xs text-muted">
          <span className="font-medium">Security level</span>
          <span className="font-semibold text-ink">{strengthLabel}</span>
        </div>

        <div className="mt-2.5 grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((tier) => {
            const isActive = tier <= strengthTier;
            const color = isActive
              ? TIER_COLORS[strengthTier - 1]
              : 'bg-surface-muted border border-hairline/60';
            return (
              <div
                key={tier}
                className={`h-2 rounded-full transition-all duration-300 ${color}`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
