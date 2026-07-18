import { cn } from '@/lib/utils';

export type StoreCatalogAttributeOption = {
  key: string;
  label: string;
  count?: number;
};

interface StoreCatalogAttributeChipsProps {
  attributes: readonly StoreCatalogAttributeOption[];
  selectedKeys: readonly string[];
  onToggle: (key: string) => void;
  className?: string;
}

export function StoreCatalogAttributeChips({
  attributes,
  selectedKeys,
  onToggle,
  className,
}: StoreCatalogAttributeChipsProps) {
  if (attributes.length === 0) return null;

  return (
    <div className={cn('min-w-0', className)}>
      <ul
        className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="list"
        aria-label="Filtrar por atributos"
      >
        {attributes.map((attr) => {
          const isActive = selectedKeys.includes(attr.key);
          const disabled = attr.count === 0;
          return (
            <li key={attr.key} className="shrink-0">
              <button
                type="button"
                onClick={() => onToggle(attr.key)}
                aria-pressed={isActive}
                disabled={disabled}
                className={cn(
                  'inline-flex h-8 max-w-[14rem] items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
                  'disabled:pointer-events-none disabled:opacity-45',
                  isActive
                    ? 'border-[#E30613] bg-[#FFF5F5] text-[#E30613]'
                    : 'border-border/80 bg-white text-[#444444] hover:border-[#E30613]/40 hover:bg-[#FFFAFA]',
                )}
              >
                <span className="truncate">{attr.label}</span>
                {typeof attr.count === 'number' ? (
                  <span
                    className={cn(
                      'tabular-nums text-[0.65rem] font-medium',
                      isActive ? 'text-[#E30613]/80' : 'text-muted-foreground',
                    )}
                  >
                    {attr.count}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
