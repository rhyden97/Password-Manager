import { useState } from 'react';
import { SecurityCodeItem, SecurityCodeFormData } from '../../types/securityCode';
import { SecurityCodeCard } from './SecurityCodeCard';
import { SecurityCodeModal } from './SecurityCodeModal';
import { PageHeader } from '../ui/PageHeader';
import { SearchField } from '../ui/SearchField';
import { EmptyState } from '../ui/EmptyState';
import { Plus, SearchX, ShieldAlert } from 'lucide-react';

interface SecurityCodesViewProps {
  readonly securityCodes: SecurityCodeItem[];
  readonly searchTerm: string;
  readonly onSearchChange: (term: string) => void;
  readonly onCopy: (text: string, label: string) => void;
  readonly onConsumeCode: (codeId: string, code: string) => Promise<boolean>;
  readonly onSave: (data: SecurityCodeFormData) => Promise<boolean>;
  readonly onDelete: (codeId: string) => void;
  readonly isLoading: boolean;
}

export function SecurityCodesView({
  securityCodes,
  searchTerm,
  onSearchChange,
  onCopy,
  onConsumeCode,
  onSave,
  onDelete,
  isLoading,
}: SecurityCodesViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SecurityCodeFormData | null>(null);

  const handleOpenNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: SecurityCodeItem) => {
    setEditingItem({
      id: item.id,
      title: item.title,
      codes: item.codes,
      file_name: item.file_name || '',
      file_type: item.file_type || '',
      file_data: '',
    });
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="2FA Backup Codes"
        description="Store and manage your 2FA recovery backup codes."
        action={
          <button
            type="button"
            onClick={handleOpenNew}
            className="fw-btn fw-btn-primary w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New backup codes
          </button>
        }
      />

      <div className="flex flex-col gap-3">
        <SearchField
          value={searchTerm}
          onChange={onSearchChange}
          label="Search 2FA backup codes"
          placeholder="Search by service or title..."
        />

        {securityCodes.length === 0 ? (
          searchTerm ? (
            <EmptyState
              icon={<SearchX className="h-6 w-6" />}
              title="No results found"
              description="No backup codes match your search query."
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
              icon={<ShieldAlert className="h-6 w-6" />}
              title="No backup codes yet"
              description="Save recovery codes for your accounts."
              action={
                <button type="button" onClick={handleOpenNew} className="fw-btn fw-btn-primary">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  New backup codes
                </button>
              }
            />
          )
        ) : (
          <div className="fw-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3 sm:px-5">
              <h2 className="text-xs font-semibold text-muted">
                {securityCodes.length}{' '}
                {securityCodes.length === 1 ? 'record' : 'records'}
              </h2>
            </div>
            <div className="divide-y divide-hairline">
              {securityCodes.map((item) => (
                <SecurityCodeCard
                  key={item.id}
                  codeItem={item}
                  onCopy={onCopy}
                  onConsumeCode={onConsumeCode}
                  onEdit={handleOpenEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <SecurityCodeModal
        isOpen={isModalOpen}
        initialData={editingItem}
        onClose={() => setIsModalOpen(false)}
        onSave={onSave}
        isLoading={isLoading}
      />
    </div>
  );
}
