import { useState } from 'react';
import { SecurityCodeItem } from '../../types/securityCode';
import { Check, Copy, Download, FileText, Pencil, Trash2 } from 'lucide-react';
import { IconButton } from '../ui/IconButton';
import { parseSecurityCodes } from '../../utils/securityCodeParser';
import { ServiceIcon } from '../ui/ServiceIcon';

interface SecurityCodeCardProps {
  readonly codeItem: SecurityCodeItem;
  readonly onCopy: (text: string, label: string) => void;
  readonly onConsumeCode: (codeId: string, code: string) => Promise<boolean>;
  readonly onEdit: (item: SecurityCodeItem) => void;
  readonly onDelete: (codeId: string) => void;
}

function triggerDownload(codes: string, rawFileName?: string) {
  if (!rawFileName) return;
  const baseName = rawFileName.split(/[\\/]/).pop()?.replace(/[^\w.\- ]/g, '_') || 'fortress-codes.txt';
  const downloadName = /\.(txt|csv)$/i.test(baseName) ? baseName : `${baseName}.txt`;
  const blob = new Blob([codes], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = downloadName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function SecurityCodeCard({
  codeItem,
  onCopy,
  onConsumeCode,
  onEdit,
  onDelete,
}: SecurityCodeCardProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const codeLines = parseSecurityCodes(codeItem.codes);

  const handleCopyCode = (code: string) => {
    onCopy(code, 'Code');
    setCopiedCode(code);
    window.setTimeout(() => setCopiedCode(null), 1800);
  };

  return (
    <div className="group flex flex-col gap-3.5 px-4 py-4 transition-colors hover:bg-surface-subtle/80 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3.5">
          <ServiceIcon title={codeItem.title} />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold tracking-[-0.015em] text-ink">
              {codeItem.title}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-hairline/80 bg-surface-subtle px-2.5 py-0.5 text-xs font-medium text-muted">
                <span className="fw-mono font-semibold text-ink">{codeLines.length}</span>
                <span>available</span>
              </span>
              {codeItem.file_name && (
                <span className="inline-flex items-center gap-1 text-xs text-muted">
                  <FileText className="h-3 w-3 opacity-60" aria-hidden="true" />
                  <span className="truncate max-w-37.5">{codeItem.file_name}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          {codeItem.file_name && (
            <IconButton
              label={`Download file (${codeItem.file_name})`}
              size="small"
              onClick={() => triggerDownload(codeItem.codes, codeItem.file_name)}
            >
              <Download className="h-4 w-4" />
            </IconButton>
          )}
          <IconButton label="Edit codes" size="small" onClick={() => onEdit(codeItem)}>
            <Pencil className="h-4 w-4" />
          </IconButton>
          <IconButton
            label="Delete record"
            size="small"
            tone="danger"
            onClick={() => onDelete(codeItem.id)}
          >
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      <div className="fw-inset max-h-56 overflow-y-auto">
        {codeLines.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-muted">All backup codes have been consumed</p>
        ) : (
          <div className="divide-y divide-hairline">
            {codeLines.map((code, index) => (
              <div
                key={`${codeItem.id}-${index}`}
                className="flex items-center justify-between gap-2 px-3.5 py-2.5 transition-colors hover:bg-surface/50"
              >
                <span className="min-w-0 select-all truncate font-mono text-xs tracking-wider text-ink font-medium">
                  {code}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label="Copy code"
                    onClick={() => handleCopyCode(code)}
                    className={`inline-flex h-7 items-center gap-1 rounded-full px-2 text-xs font-semibold transition-colors ${
                      copiedCode === code
                        ? 'bg-success-soft text-success'
                        : 'text-muted hover:text-ink hover:bg-surface-muted'
                    }`}
                  >
                    {copiedCode === code ? (
                      <>
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="text-xs">Copied</span>
                      </>
                    ) : (
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleCopyCode(code);
                      onConsumeCode(codeItem.id, code);
                    }}
                    className="inline-flex min-h-7 items-center gap-1 rounded-full border border-hairline bg-surface-subtle px-2.5 text-xs font-semibold text-muted transition-colors hover:border-success/30 hover:bg-success-soft hover:text-success"
                    title="Copy and mark as used"
                  >
                    <Check className="h-3 w-3" aria-hidden="true" />
                    Use
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
