import { AuthShell } from './AuthShell';
import { AuthView } from './AuthView';
import { RegistrationSuccessView } from './RegistrationSuccessView';

interface AuthFlowProps {
  readonly email: string;
  readonly onChangeEmail: (email: string) => void;
  readonly password: string;
  readonly onChangePassword: (password: string) => void;
  readonly isRegistering: boolean;
  readonly onToggleRegistering: (isRegistering: boolean) => void;
  readonly rememberCreds: boolean;
  readonly onToggleRememberCreds: (remember: boolean) => void;
  readonly isLoading: boolean;
  readonly isRegistrationSuccess: boolean;
  readonly onDismissRegistrationSuccess: () => void;
  readonly onSubmit: () => Promise<boolean>;
}

export function AuthFlow({
  email,
  onChangeEmail,
  password,
  onChangePassword,
  isRegistering,
  onToggleRegistering,
  rememberCreds,
  onToggleRememberCreds,
  isLoading,
  isRegistrationSuccess,
  onDismissRegistrationSuccess,
  onSubmit,
}: AuthFlowProps) {
  if (isRegistrationSuccess) {
    return (
      <AuthShell
        title="Confirm your email"
        description="You're almost there. Just one step left to access Fortress."
      >
        <RegistrationSuccessView email={email} onGoToLogin={onDismissRegistrationSuccess} />
      </AuthShell>
    );
  }

  return (
    <AuthView
      email={email}
      onChangeEmail={onChangeEmail}
      password={password}
      onChangePassword={onChangePassword}
      isRegistering={isRegistering}
      onToggleRegistering={onToggleRegistering}
      rememberCreds={rememberCreds}
      onToggleRememberCreds={onToggleRememberCreds}
      isLoading={isLoading}
      onSubmit={onSubmit}
    />
  );
}
