import { Search, X } from 'lucide-react';

interface SearchFieldProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder: string;
  readonly label: string;
  readonly className?: string;
}

export function SearchField({
  value,
  onChange,
  placeholder,
  label,
  className = '',
}: SearchFieldProps) {
  return (
    <div className={`relative w-full ${className}`}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
      <input
        type="search"
        aria-label={label}
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="fw-input fw-search"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-surface-muted text-muted hover:text-ink transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
