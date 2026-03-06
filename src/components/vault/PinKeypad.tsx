import { Delete } from 'lucide-react';

interface PinKeypadProps {
  readonly isLocked: boolean;
  readonly isLoading: boolean;
  readonly hasDigits: boolean;
  readonly onKeyPress: (digit: string) => void;
  readonly onBackspace: () => void;
  readonly onClear: () => void;
}

const KEYPAD_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

export function PinKeypad({
  isLocked,
  isLoading,
  hasDigits,
  onKeyPress,
  onBackspace,
  onClear,
}: PinKeypadProps) {
  const isDisabled = isLocked || isLoading;

  return (
    <div className="grid grid-cols-3 gap-x-4 gap-y-3.5 w-full max-w-60 justify-items-center">
      {KEYPAD_ROWS.flat().map((digit) => (
        <button
          key={digit}
          type="button"
          disabled={isDisabled}
          onClick={() => onKeyPress(digit)}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-hairline/80 bg-surface text-2xl font-normal text-ink shadow-2xs transition-all active:scale-92 active:bg-surface-muted hover:border-hairline-strong disabled:opacity-30"
        >
          {digit}
        </button>
      ))}

      <button
        type="button"
        disabled={isDisabled || !hasDigits}
        onClick={onClear}
        aria-label="Clear all PIN"
        className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-xs font-medium text-muted shadow-2xs transition-all active:scale-92 active:bg-surface-muted hover:border-hairline-strong hover:text-ink disabled:opacity-20"
      >
        Clear
      </button>

      <button
        type="button"
        disabled={isDisabled}
        onClick={() => onKeyPress('0')}
        className="flex h-16 w-16 items-center justify-center rounded-full border border-hairline/80 bg-surface text-2xl font-normal text-ink shadow-2xs transition-all active:scale-92 active:bg-surface-muted hover:border-hairline-strong disabled:opacity-30"
      >
        0
      </button>

      <button
        type="button"
        disabled={isDisabled || !hasDigits}
        onClick={onBackspace}
        aria-label="Backspace"
        className="flex h-16 w-16 items-center justify-center rounded-full text-muted transition-all active:scale-92 hover:text-ink disabled:opacity-20"
      >
        <Delete className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
