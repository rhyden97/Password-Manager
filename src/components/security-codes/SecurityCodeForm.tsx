import { useState } from 'react';
import { SecurityCodeFormData } from '../../types/securityCode';
import { FileText, Sparkles, Upload } from 'lucide-react';
import { formatSecurityCodes } from '../../utils/securityCodeParser';
import { ServiceIcon } from '../ui/ServiceIcon';
import { useSecurityCodeImport } from '../../hooks/useSecurityCodeImport';

interface SecurityCodeFormProps {
  readonly initialData: SecurityCodeFormData | null;
  readonly onClose: () => void;
  readonly onSave: (data: SecurityCodeFormData) => Promise<boolean>;
  readonly isLoading: boolean;
}

export function SecurityCodeForm({
  initialData,
  onClose,
  onSave,
  isLoading,
}: SecurityCodeFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const {
    codes,
    setCodes,
    fileName,
    fileType,
    fileError,
    handleFileUpload,
    handlePasteCodes,
    handleFormatCodes,
  } = useSecurityCodeImport({
    initialCodes: initialData?.codes || '',
    initialFileName: initialData?.file_name || '',
    initialFileType: initialData?.file_type || '',
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const formattedCodes = formatSecurityCodes(codes) || codes.trim();
    const success = await onSave({
      id: initialData?.id || '',
      title,
      codes: formattedCodes,
      file_name: fileName,
      file_type: fileType,
      file_data: '',
    });
    if (success) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="fw-label" htmlFor="sec-title">
          Service or account *
        </label>
        <div className="mt-1.5 flex items-center gap-2.5">
          <ServiceIcon title={title || '2FA'} size="large" />
          <input
            type="text"
            id="sec-title"
            required
            placeholder="e.g. GitHub 2FA, Google Backup"
            className="fw-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <label className="fw-label" htmlFor="sec-codes">
            Codes *
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleFormatCodes}
              title="Split codes into individual lines"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-subtle border border-hairline text-ink hover:bg-surface-muted active:scale-95 transition-all"
            >
              <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
              <span>Format</span>
            </button>
            <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-subtle border border-hairline text-ink hover:bg-surface-muted active:scale-95 transition-all cursor-pointer">
              <Upload className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
              <span>Upload file</span>
              <input
                type="file"
                accept=".txt,.csv,text/plain,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
        <textarea
          id="sec-codes"
          required
          rows={6}
          placeholder={'1a2b-3c4d\n5e6f-7g8h\n9i0j-1k2l\n3m4n-5o6p'}
          className="fw-input mt-1.5 resize-none font-mono text-sm leading-relaxed"
          value={codes}
          onChange={(e) => setCodes(e.target.value)}
          onPaste={handlePasteCodes}
        />
      </div>

      {fileError && <p className="text-xs font-medium text-danger">{fileError}</p>}

      {fileName && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-surface-subtle border border-hairline text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate text-ink font-medium">{fileName}</span>
          </div>
          <span className="text-muted shrink-0 text-2xs font-mono uppercase">
            {fileType.split('/')[1] || 'TXT'}
          </span>
        </div>
      )}

      <div className="flex flex-col-reverse gap-2.5 pt-3 sm:flex-row sm:justify-end border-t border-hairline/60">
        <button
          type="button"
          onClick={onClose}
          className="fw-btn fw-btn-ghost rounded-full px-5 py-2.5 text-sm font-semibold active:scale-95 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="fw-btn fw-btn-primary rounded-full px-6 py-2.5 text-sm font-semibold active:scale-95 transition-all shadow-sm"
        >
          {isLoading ? (
            <>
              <span className="fw-spinner" aria-hidden="true" />
              Saving...
            </>
          ) : (
            'Save'
          )}
        </button>
      </div>
    </form>
  );
}
