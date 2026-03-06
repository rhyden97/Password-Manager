interface PinDotsDisplayProps {
  readonly pinLength: number;
  readonly hasShaken: boolean;
  readonly onClick: () => void;
}

export function PinDotsDisplay({
  pinLength,
  hasShaken,
  onClick,
}: PinDotsDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-60">
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onClick();
        }}
        className={`w-full rounded-2xl bg-surface-subtle border border-hairline px-4 h-13 flex items-center justify-center cursor-text transition-all ${
          hasShaken ? 'animate-shake' : ''
        }`}
        aria-label={
          pinLength === 0
            ? 'PIN input ready'
            : `${pinLength} digits entered`
        }
      >
        {pinLength === 0 ? (
          <div className="flex items-center justify-center gap-2.5 select-none pointer-events-none">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-2.5 w-2.5 rounded-full bg-muted/40"
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2.5 flex-nowrap">
            {Array.from({ length: pinLength }).map((_, index) => (
              <div
                key={index}
                className="h-2.5 w-2.5 rounded-full bg-primary shadow-xs animate-pop"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
