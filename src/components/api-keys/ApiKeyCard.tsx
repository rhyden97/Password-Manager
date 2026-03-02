import { useState } from 'react';
import { ApiKeyItem } from '../../types/apiKey';
import { Calendar, Check, Copy, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { IconButton } from '../ui/IconButton';
import { ServiceIcon } from '../ui/ServiceIcon';

interface ApiKeyCardProps {
  readonly apiKey: ApiKeyItem;
  readonly isVisible: boolean;
  readonly onToggleVisibility: (id: string) => void;
  readonly onCopy: (text: string, label: string) => void;
  readonly onEdit: (apiKey: ApiKeyItem) => void;
  readonly onDelete: (id: string) => void;
}

function getEnvStyle(env: string) {
  const lower = env.toLowerCase();
  if (lower.includes('prod')) {
    return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
  }
  if (lower.includes('stag') || lower.includes('test') || lower.includes('dev')) {
    return 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400';
  }
  return 'border-hairline bg-surface-subtle text-muted';
}

export function ApiKeyCard({
  apiKey,
  isVisible,
  onToggleVisibility,
  onCopy,
  onEdit,
  onDelete,
}: ApiKeyCardProps) {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = () => {
    onCopy(apiKey.key, 'API Key');
    setHasCopied(true);
    window.setTimeout(() => setHasCopied(false), 1800);
  };

  return (
    <div className="group flex flex-col gap-3.5 px-4 py-4 transition-colors hover:bg-surface-subtle/80 sm:px-5 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-3.5">
        <ServiceIcon title={apiKey.name} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold tracking-[-0.015em] text-ink">
              {apiKey.name}
            </h3>
          </div>

          <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-2xs font-semibold ${getEnvStyle(
                apiKey.environment
              )}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
              {apiKey.environment || 'No environment'}
            </span>

            {apiKey.scopes && (
              <>
                <span className="text-subtle" aria-hidden="true">
                  ·
                </span>
                <span className="max-w-44 truncate text-muted" title={apiKey.scopes}>
                  {apiKey.scopes}
                </span>
              </>
            )}

            {apiKey.expires_at && (
              <>
                <span className="text-subtle" aria-hidden="true">
                  ·
                </span>
                <span className="inline-flex items-center gap-1 text-muted">
                  <Calendar className="h-3 w-3 opacity-60" aria-hidden="true" />
                  <span>{apiKey.expires_at}</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2.5 md:justify-end">
        <div className="flex min-w-0 flex-1 items-center gap-1 rounded-full border border-hairline/70 bg-surface-subtle px-3 py-1.5 shadow-2xs md:flex-none">
          <span
            className={`min-w-0 flex-1 md:flex-none md:w-44 overflow-hidden whitespace-nowrap font-mono text-xs text-ink select-none ${
              isVisible ? 'select-all tracking-normal' : 'tracking-[0.2em]'
            }`}
          >
            {isVisible ? apiKey.key : '••••••••••••'}
          </span>

          <IconButton
            label={isVisible ? 'Hide API key' : 'Show API key'}
            size="small"
            className="h-7 w-7 text-muted hover:text-ink"
            onClick={() => onToggleVisibility(apiKey.id)}
          >
            {isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </IconButton>

          <button
            type="button"
            aria-label="Copy API key"
            title="Copy API key"
            onClick={handleCopy}
            className={`inline-flex h-7 items-center gap-1 rounded-full px-2 text-xs font-semibold transition-colors ${
              hasCopied
                ? 'bg-success-soft text-success'
                : 'text-muted hover:text-ink hover:bg-surface-muted'
            }`}
          >
            {hasCopied ? (
              <>
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="text-xs">Copied</span>
              </>
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-0.5">
          <IconButton label="Edit API key" size="small" onClick={() => onEdit(apiKey)}>
            <Pencil className="h-4 w-4" />
          </IconButton>
          <IconButton
            label="Delete API key"
            size="small"
            tone="danger"
            onClick={() => onDelete(apiKey.id)}
          >
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
