import { useState } from 'react';
import { CredentialItem } from '../../types/credential';
import { Check, Copy, ExternalLink, Globe, Pencil, Trash2 } from 'lucide-react';
import { IconButton } from '../ui/IconButton';
import { ServiceIcon } from '../ui/ServiceIcon';
import { CredentialPasswordPill } from './CredentialPasswordPill';

interface CredentialCardProps {
  readonly credential: CredentialItem;
  readonly isVisible: boolean;
  readonly onToggleVisibility: (id: string) => void;
  readonly onCopy: (text: string, label: string) => void;
  readonly onEdit: (credential: CredentialItem) => void;
  readonly onDelete: (id: string) => void;
}

function toSafeHttpUrl(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export function CredentialCard({
  credential,
  isVisible,
  onToggleVisibility,
  onCopy,
  onEdit,
  onDelete,
}: CredentialCardProps) {
  const [hasCopiedUser, setHasCopiedUser] = useState(false);
  const safeUrl = credential.url ? toSafeHttpUrl(credential.url) : null;

  const handleCopyUser = () => {
    if (!credential.username) return;
    onCopy(credential.username, 'Username');
    setHasCopiedUser(true);
    window.setTimeout(() => setHasCopiedUser(false), 1800);
  };

  return (
    <div className="group flex flex-col gap-3.5 px-4 py-4 transition-colors hover:bg-surface-subtle/80 sm:px-5 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-3.5">
        <ServiceIcon title={credential.title} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold tracking-[-0.015em] text-ink">
              {credential.title}
            </h3>
            {credential.notes && (
              <span className="hidden h-1.5 w-1.5 rounded-full bg-subtle/50 sm:inline-block" title="Has notes" />
            )}
          </div>

          <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            {credential.username && (
              <span className="inline-flex min-w-0 items-center gap-1">
                <span className="max-w-47.5 truncate text-body/85 font-medium">{credential.username}</span>
                <button
                  type="button"
                  aria-label="Copy username"
                  title="Copy username"
                  onClick={handleCopyUser}
                  className="inline-flex h-5 items-center gap-0.5 rounded px-1 text-xs text-muted hover:text-ink hover:bg-surface-muted transition-colors"
                >
                  {hasCopiedUser ? (
                    <span className="flex items-center gap-0.5 text-success font-medium">
                      <Check className="h-3 w-3" />
                      <span>Copied</span>
                    </span>
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </span>
            )}
            {credential.url && (
              <>
                <span className="text-subtle" aria-hidden="true">
                  ·
                </span>
                {safeUrl ? (
                  <a
                    href={safeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex max-w-50 items-center gap-1 truncate text-link hover:underline"
                  >
                    <Globe className="h-3 w-3 shrink-0 opacity-70" aria-hidden="true" />
                    <span className="truncate">{credential.url.replace(/^https?:\/\//i, '').replace(/\/$/, '')}</span>
                    <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-60" aria-hidden="true" />
                  </a>
                ) : (
                  <span className="max-w-50 truncate text-muted">{credential.url}</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2.5 md:justify-end">
        <CredentialPasswordPill
          password={credential.password}
          isVisible={isVisible}
          onToggleVisibility={() => onToggleVisibility(credential.id)}
          onCopy={onCopy}
        />

        <div className="flex items-center gap-0.5">
          <IconButton
            label="Edit credential"
            size="small"
            onClick={() => onEdit(credential)}
          >
            <Pencil className="h-4 w-4" />
          </IconButton>
          <IconButton
            label="Delete credential"
            size="small"
            tone="danger"
            onClick={() => onDelete(credential.id)}
          >
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
