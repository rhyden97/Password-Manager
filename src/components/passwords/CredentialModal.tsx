import { CredentialFormData } from '../../types/credential';
import { ModalShell } from '../ui/ModalShell';
import { CredentialForm } from './CredentialForm';

interface CredentialModalProps {
  readonly isOpen: boolean;
  readonly initialData: CredentialFormData | null;
  readonly onClose: () => void;
  readonly onSave: (data: CredentialFormData) => Promise<boolean>;
  readonly isLoading: boolean;
}

export function CredentialModal({
  isOpen,
  initialData,
  onClose,
  onSave,
  isLoading,
}: CredentialModalProps) {
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      titleId="credential-modal-title"
      title={initialData ? 'Edit credential' : 'New credential'}
      subtitle={
        initialData
          ? 'Update credential details'
          : 'Save credentials to your vault'
      }
    >
      <CredentialForm
        key={initialData?.id || 'new'}
        initialData={initialData}
        onClose={onClose}
        onSave={onSave}
        isLoading={isLoading}
      />
    </ModalShell>
  );
}
