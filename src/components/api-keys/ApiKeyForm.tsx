import { useState } from 'react';
import { ApiKeyFormData } from '../../types/apiKey';
import { PasswordInput } from '../ui/PasswordInput';
import { ServiceIcon } from '../ui/ServiceIcon';

interface ApiKeyFormProps {
  readonly initialData: ApiKeyFormData | null;
  readonly onClose: () => void;
  readonly onSave: (data: ApiKeyFormData) => Promise<boolean>;
  readonly isLoading: boolean;
}

const COMMON_ENVIRONMENTS = ['production', 'staging', 'development'] as const;

export function ApiKeyForm({ initialData, onClose, onSave, isLoading }: ApiKeyFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [key, setKey] = useState(initialData?.key || '');
  const [environment, setEnvironment] = useState(initialData?.environment || '');
  const [scopes, setScopes] = useState(initialData?.scopes || '');
  const [expiresAt, setExpiresAt] = useState(initialData?.expires_at || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const success = await onSave({ id: initialData?.id || '', name, key, environment, scopes, expires_at: expiresAt, notes });
    if (success) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="fw-label" htmlFor="api-name">Service / Name *</label>
        <div className="mt-1.5 flex items-center gap-2.5">
          <ServiceIcon title={name || 'API'} size="large" />
          <input
            type="text"
            id="api-name"
            required
            placeholder="e.g. OpenAI, Stripe, AWS"
            className="fw-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="fw-label" htmlFor="api-key-value">API Key / Secret *</label>
        <PasswordInput
          id="api-key-value"
          required
          autoComplete="off"
          spellCheck={false}
          placeholder="sk-..."
          showLabel="Show API key"
          hideLabel="Hide API key"
          containerClassName="mt-1.5"
          className="font-mono text-sm tracking-tight"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="fw-label" htmlFor="api-environment">Environment</label>
          <input
            type="text"
            id="api-environment"
            placeholder="production, staging, dev..."
            className="fw-input mt-1.5"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {COMMON_ENVIRONMENTS.map((env) => (
              <button
                key={env}
                type="button"
                onClick={() => setEnvironment(env)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-all ${
                  environment.toLowerCase() === env
                    ? 'bg-primary text-white shadow-2xs'
                    : 'bg-surface-subtle text-muted hover:text-ink border border-hairline'
                }`}
              >
                {env}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="fw-label" htmlFor="api-expires">Expires</label>
          <input
            type="date"
            id="api-expires"
            className="fw-input mt-1.5"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="fw-label" htmlFor="api-scopes">Permissions / Scopes</label>
        <input
          type="text"
          id="api-scopes"
          placeholder="read:users, write:orders"
          className="fw-input mt-1.5"
          value={scopes}
          onChange={(e) => setScopes(e.target.value)}
        />
      </div>

      <div>
        <label className="fw-label" htmlFor="api-notes">Notes</label>
        <textarea
          id="api-notes"
          rows={3}
          placeholder="Project, usage, rotation policy..."
          className="fw-input mt-1.5 resize-none"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex flex-col-reverse gap-2.5 pt-3 sm:flex-row sm:justify-end border-t border-hairline/60">
        <button type="button" onClick={onClose} className="fw-btn fw-btn-ghost rounded-full px-5 py-2.5 text-sm font-semibold active:scale-95 transition-all">Cancel</button>
        <button type="submit" disabled={isLoading} className="fw-btn fw-btn-primary rounded-full px-6 py-2.5 text-sm font-semibold active:scale-95 transition-all shadow-sm">
          {isLoading ? (<><span className="fw-spinner" aria-hidden="true" />Saving...</>) : 'Save'}
        </button>
      </div>
    </form>
  );
}
