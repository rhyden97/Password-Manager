import { SecurityCodeFormData } from '../../types/securityCode';
import { ModalShell } from '../ui/ModalShell';
import { SecurityCodeForm } from './SecurityCodeForm';

interface SecurityCodeModalProps {
  readonly isOpen: boolean;
  readonly initialData: SecurityCodeFormData | null;
  readonly onClose: () => void;
  readonly onSave: (data: SecurityCodeFormData) => Promise<boolean>;
  readonly isLoading: boolean;
}

export function SecurityCodeModal({
  isOpen,
  initialData,
  onClose,
  onSave,
  isLoading,
}: SecurityCodeModalProps) {
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      titleId="security-code-modal-title"
      title={initialData ? 'Edit 2FA codes' : 'New recovery codes'}
      subtitle={
        initialData
          ? 'Update backup codes'
          : 'Save 2FA recovery codes'
      }
    >
      <SecurityCodeForm
        key={initialData?.id || 'new'}
        initialData={initialData}
        onClose={onClose}
        onSave={onSave}
        isLoading={isLoading}
      />
    </ModalShell>
  );
}
