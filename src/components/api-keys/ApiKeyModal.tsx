import { ApiKeyFormData } from '../../types/apiKey';
import { ModalShell } from '../ui/ModalShell';
import { ApiKeyForm } from './ApiKeyForm';

interface ApiKeyModalProps {
  readonly isOpen: boolean;
  readonly initialData: ApiKeyFormData | null;
  readonly onClose: () => void;
  readonly onSave: (data: ApiKeyFormData) => Promise<boolean>;
  readonly isLoading: boolean;
}

export function ApiKeyModal({
  isOpen,
  initialData,
  onClose,
  onSave,
  isLoading,
}: ApiKeyModalProps) {
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      titleId="api-key-modal-title"
      title={initialData ? 'Edit API key' : 'New API key'}
      subtitle={
        initialData
          ? 'Update API key details'
          : 'Save developer key to your vault'
      }
    >
      <ApiKeyForm
        key={initialData?.id || 'new'}
        initialData={initialData}
        onClose={onClose}
        onSave={onSave}
        isLoading={isLoading}
      />
    </ModalShell>
  );
}
