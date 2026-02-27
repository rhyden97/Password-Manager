import {
  getBrandDefinition,
  getLettermarkFallback,
  getSemanticFallback,
} from './brandDefinitions';

interface ServiceIconProps {
  readonly title: string;
  readonly size?: 'normal' | 'large';
  readonly className?: string;
}

export function ServiceIcon({
  title,
  size = 'normal',
  className = '',
}: ServiceIconProps) {
  const brand =
    getBrandDefinition(title) ||
    getSemanticFallback(title) ||
    getLettermarkFallback(title);

  const dimensionClass = size === 'large' ? 'h-11 w-11' : 'h-10 w-10';

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-xl transition-all select-none ${dimensionClass} ${brand.bg} ${brand.border || 'border border-hairline'} ${className}`}
      style={{
        boxShadow:
          brand.shadow ||
          '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
      }}
      aria-hidden="true"
    >
      {brand.content}
    </div>
  );
}
