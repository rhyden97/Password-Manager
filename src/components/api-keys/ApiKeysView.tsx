import { useState } from 'react';
import { ApiKeyItem, ApiKeyFormData } from '../../types/apiKey';
import { ApiKeyCard } from './ApiKeyCard';
import { ApiKeyModal } from './ApiKeyModal';
import { PageHeader } from '../ui/PageHeader';
import { SearchField } from '../ui/SearchField';
import { EmptyState } from '../ui/EmptyState';
import { KeyRound, Plus, SearchX } from 'lucide-react';

interface ApiKeysViewProps {
  readonly apiKeys: ApiKeyItem[];
  readonly searchTerm: string;
  readonly onSearchChange: (term: string) => void;
  readonly visibleKeys: Record<string, boolean>;
  readonly onToggleVisibility: (id: string) => void;
  readonly onCopy: (text: string, label: string) => void;
  readonly onSave: (data: ApiKeyFormData) => Promise<boolean>;
  readonly onDelete: (id: string) => void;
  readonly isLoading: boolean;
}

export function ApiKeysView({
  apiKeys,
  searchTerm,
  onSearchChange,
  visibleKeys,
  onToggleVisibility,
  onCopy,
  onSave,
  onDelete,
  isLoading,
}: ApiKeysViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ApiKeyFormData | null>(null);

  const handleOpenNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ApiKeyItem) => {
    setEditingItem({
      id: item.id,
      name: item.name,
      key: item.key,
      environment: item.environment,
      scopes: item.scopes,
      expires_at: item.expires_at,
      notes: item.notes,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="API Keys"
        description="Store API keys, tokens, and developer secrets."
        action={
          <button type="button" onClick={handleOpenNew} className="fw-btn fw-btn-primary w-full sm:w-auto">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New API key
          </button>
        }
      />

      <div className="flex flex-col gap-3">
        <SearchField
          value={searchTerm}
          onChange={onSearchChange}
          label="Search API keys"
          placeholder="Search service, environment, or scopes..."
        />

        {apiKeys.length === 0 ? (
          searchTerm ? (
            <EmptyState
              icon={<SearchX className="h-6 w-6" />}
              title="No results found"
              description="No API keys match your search query."
              action={
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="fw-btn fw-btn-ghost fw-btn-sm"
                >
                  Clear search
                </button>
              }
            />
          ) : (
            <EmptyState
              icon={<KeyRound className="h-6 w-6" />}
              title="No API keys yet"
              description="Save API keys and tokens for your projects."
              action={
                <button type="button" onClick={handleOpenNew} className="fw-btn fw-btn-primary">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  New API key
                </button>
              }
            />
          )
        ) : (
          <div className="fw-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3 sm:px-5">
              <h2 className="text-xs font-semibold text-muted">
                {apiKeys.length} {apiKeys.length === 1 ? 'key' : 'keys'}
              </h2>
            </div>
            <div className="divide-y divide-hairline">
              {apiKeys.map((item) => (
                <ApiKeyCard
                  key={item.id}
                  apiKey={item}
                  isVisible={Boolean(visibleKeys[item.id])}
                  onToggleVisibility={onToggleVisibility}
                  onCopy={onCopy}
                  onEdit={handleOpenEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <ApiKeyModal
        isOpen={isModalOpen}
        initialData={editingItem}
        onClose={() => setIsModalOpen(false)}
        onSave={onSave}
        isLoading={isLoading}
      />
    </div>
  );
}
