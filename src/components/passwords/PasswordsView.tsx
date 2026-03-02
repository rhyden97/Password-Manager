import { useState } from 'react';
import { CredentialItem, CredentialFormData } from '../../types/credential';
import { CredentialCard } from './CredentialCard';
import { CredentialModal } from './CredentialModal';
import { PageHeader } from '../ui/PageHeader';
import { EmptyState } from '../ui/EmptyState';
import { SearchField } from '../ui/SearchField';
import { KeyRound, Plus, SearchX } from 'lucide-react';

interface PasswordsViewProps {
  readonly credentials: CredentialItem[];
  readonly totalCredentialsCount: number;
  readonly searchTerm: string;
  readonly onSearchChange: (term: string) => void;
  readonly visiblePasswords: Record<string, boolean>;
  readonly onToggleVisibility: (id: string) => void;
  readonly onCopy: (text: string, label: string) => void;
  readonly onSave: (data: CredentialFormData) => Promise<boolean>;
  readonly onDelete: (id: string) => void;
  readonly isLoading: boolean;
  readonly apiKeysCount?: number;
  readonly securityCodesCount?: number;
}

export function PasswordsView({
  credentials,
  searchTerm,
  onSearchChange,
  visiblePasswords,
  onToggleVisibility,
  onCopy,
  onSave,
  onDelete,
  isLoading,
}: PasswordsViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CredentialFormData | null>(null);

  const handleOpenNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: CredentialItem) => {
    setEditingItem({
      id: item.id,
      title: item.title,
      url: item.url,
      username: item.username,
      password: item.password,
      notes: item.notes,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Passwords"
        description="Store and manage your passwords securely."
        action={
          <button
            type="button"
            onClick={handleOpenNew}
            className="fw-btn fw-btn-primary w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New password
          </button>
        }
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <SearchField
            value={searchTerm}
            onChange={onSearchChange}
            label="Search passwords"
            placeholder="Search by title, username, or URL..."
          />
        </div>

        {credentials.length === 0 ? (
          searchTerm ? (
            <EmptyState
              icon={<SearchX className="h-6 w-6" />}
              title="No results found"
              description="No credentials match your search query."
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
              title="No passwords yet"
              description="Add your first password to get started."
              action={
                <button type="button" onClick={handleOpenNew} className="fw-btn fw-btn-primary">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  New password
                </button>
              }
            />
          )
        ) : (
          <div className="fw-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3 sm:px-5">
              <h2 className="text-xs font-semibold text-muted">
                {credentials.length} {credentials.length === 1 ? 'credential' : 'credentials'}
              </h2>
            </div>
            <div className="divide-y divide-hairline">
              {credentials.map((cred) => (
                <CredentialCard
                  key={cred.id}
                  credential={cred}
                  isVisible={Boolean(visiblePasswords[cred.id])}
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

      <CredentialModal
        isOpen={isModalOpen}
        initialData={editingItem}
        onClose={() => setIsModalOpen(false)}
        onSave={onSave}
        isLoading={isLoading}
      />
    </div>
  );
}
