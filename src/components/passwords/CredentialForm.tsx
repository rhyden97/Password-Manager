import { useState } from 'react';
import { CredentialFormData } from '../../types/credential';
import { Sparkles } from 'lucide-react';
import { generatePassword } from '../../hooks/usePasswordGenerator';
import { PasswordInput } from '../ui/PasswordInput';
import { ServiceIcon } from '../ui/ServiceIcon';

interface CredentialFormProps {
  readonly initialData: CredentialFormData | null;
  readonly onClose: () => void;
  readonly onSave: (data: CredentialFormData) => Promise<boolean>;
  readonly isLoading: boolean;
}

const GEN_OPTS = { length: 16, hasUpper: true, hasLower: true, hasNumbers: true, hasSymbols: true };

export function CredentialForm({ initialData, onClose, onSave, isLoading }: CredentialFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [username, setUsername] = useState(initialData?.username || '');
  const [password, setPassword] = useState(initialData?.password || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const success = await onSave({ id: initialData?.id || '', title, url, username, password, notes });
    if (success) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="fw-label" htmlFor="cred-title">Title or service *</label>
        <div className="mt-1.5 flex items-center gap-2.5">
          <ServiceIcon title={title || 'New'} size="large" />
          <input
            type="text"
            id="cred-title"
            required
            placeholder="e.g. Google, Netflix, GitHub"
            className="fw-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="fw-label" htmlFor="cred-url">URL / Website</label>
        <input
          type="text"
          id="cred-url"
          placeholder="https://example.com"
          className="fw-input mt-1.5"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      <div>
        <label className="fw-label" htmlFor="cred-username">Username / Email *</label>
        <input
          type="text"
          id="cred-username"
          required
          placeholder="user@example.com"
          className="fw-input mt-1.5"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <label className="fw-label" htmlFor="cred-password">Password *</label>
          <button
            type="button"
            onClick={() => setPassword(generatePassword(GEN_OPTS))}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 active:scale-95 transition-all"
          >
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            Generate secure
          </button>
        </div>
        <PasswordInput
          id="cred-password"
          required
          autoComplete="new-password"
          containerClassName="mt-1.5"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <label className="fw-label" htmlFor="cred-notes">Additional notes</label>
        <textarea
          id="cred-notes"
          rows={3}
          placeholder="Details, recovery codes, or security notes..."
          className="fw-input mt-1.5 resize-none"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

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
