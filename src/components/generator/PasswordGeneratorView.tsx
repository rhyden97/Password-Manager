import { GeneratorConfig, PasswordStrength } from '../../types/generator';
import { PageHeader } from '../ui/PageHeader';
import { GeneratorDisplay } from './GeneratorDisplay';
import { GeneratorOptions } from './GeneratorOptions';

interface PasswordGeneratorViewProps {
  readonly config: GeneratorConfig;
  readonly generatedPassword: string;
  readonly strength: PasswordStrength;
  readonly entropyBits: number;
  readonly onRegenerate: () => void;
  readonly onUpdateConfig: (partial: Partial<GeneratorConfig>) => void;
  readonly onCopy: (text: string, label: string) => void;
}

export function PasswordGeneratorView({
  config,
  generatedPassword,
  strength,
  entropyBits,
  onRegenerate,
  onUpdateConfig,
  onCopy,
}: PasswordGeneratorViewProps) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Password Generator"
        description="Generate strong, random passwords on your device."
      />

      <GeneratorDisplay
        generatedPassword={generatedPassword}
        strength={strength}
        entropyBits={entropyBits}
        onRegenerate={onRegenerate}
        onCopy={onCopy}
      />

      <GeneratorOptions config={config} onUpdateConfig={onUpdateConfig} />
    </div>
  );
}
