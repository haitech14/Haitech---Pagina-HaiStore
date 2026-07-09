import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface CatalogFilterOptionProps {
  id: string;
  label: string;
  count: number;
  active: boolean;
  onToggle: () => void;
  /** Una sola opción activa (estilo radio para Producción). */
  mode?: 'checkbox' | 'radio';
  disabled?: boolean;
  /** Lista compacta sin borde por ítem (para sidebar). */
  compact?: boolean;
}

export function CatalogFilterOption({
  id,
  label,
  count,
  active,
  onToggle,
  mode = 'checkbox',
  disabled = false,
  compact = false,
}: CatalogFilterOptionProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex w-full cursor-pointer items-center justify-between gap-2 text-left transition-colors',
        compact
          ? cn(
              'min-h-8 px-2 py-1 text-[0.6875rem]',
              active
                ? 'bg-red-50 font-medium text-red-700'
                : 'text-foreground hover:bg-muted/50',
            )
          : cn(
              'min-h-11 rounded-md border px-3 py-2 text-sm',
              active
                ? 'border-red-600 bg-red-50 text-red-700'
                : 'border-border bg-background hover:border-red-300',
            ),
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <Checkbox
          id={id}
          checked={active}
          disabled={disabled}
          onCheckedChange={(checked) => {
            if (checked === 'indeterminate') return;
            if (checked !== active) onToggle();
          }}
          aria-label={label}
          className={cn('shrink-0', mode === 'radio' && 'rounded-full')}
        />
        <span className={cn('line-clamp-2 text-pretty leading-snug', compact && 'leading-tight')}>
          {label}
        </span>
      </span>
      <span
        className={cn(
          'shrink-0 tabular-nums text-muted-foreground',
          compact ? 'text-[0.6rem]' : 'text-[0.6875rem]',
        )}
      >
        {count}
      </span>
    </label>
  );
}
