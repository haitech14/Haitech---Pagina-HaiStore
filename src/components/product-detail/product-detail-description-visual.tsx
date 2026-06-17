import { cn } from '@/lib/utils';
import type {
  ProductDescriptionVisual,
  ProductDescriptionVisualItem,
  ProductDescriptionVisualSpec,
} from '@/types/product-detail';

interface ProductDetailDescriptionVisualProps {
  visual: ProductDescriptionVisual;
  className?: string;
  variant?: 'default' | 'bar';
}

function FunctionIcon({ item }: { item: ProductDescriptionVisualItem }) {
  const Icon = item.icon;

  return (
    <li className="flex min-w-[3.25rem] flex-col items-center gap-1 text-center sm:min-w-[3.75rem]">
      <Icon className="size-7 text-muted-foreground sm:size-8" strokeWidth={1.25} aria-hidden="true" />
      <span className="text-[0.625rem] font-medium leading-tight text-muted-foreground sm:text-xs">
        {item.label}
      </span>
    </li>
  );
}

function SpecIcon({ item, compact }: { item: ProductDescriptionVisualSpec; compact?: boolean }) {
  const Icon = item.icon;
  const primaryLine = item.lines[0] ?? '';

  if (compact) {
    return (
      <li className="flex min-w-0 items-start gap-2.5">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted/30 text-muted-foreground"
          aria-hidden="true"
        >
          <Icon className="size-4" strokeWidth={1.5} />
        </span>
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-semibold leading-tight text-[#0f1f3d]">{primaryLine}</p>
          <p className="text-xs leading-snug text-muted-foreground">{item.title}</p>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-start gap-2">
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground"
        aria-hidden="true"
      >
        <Icon className="size-3.5" strokeWidth={1.5} />
      </span>
      <div className="min-w-0 space-y-0.5">
        <p className="text-[0.625rem] font-semibold leading-tight text-muted-foreground sm:text-xs">
          {item.title}
        </p>
        {item.lines.map((line) => (
          <p key={line} className="text-[0.6875rem] leading-snug text-muted-foreground/90 sm:text-xs">
            {line}
          </p>
        ))}
      </div>
    </li>
  );
}

export function ProductDetailDescriptionVisual({
  visual,
  className,
  variant = 'default',
}: ProductDetailDescriptionVisualProps) {
  const connectivity = visual.connectivity ?? [];
  const hasFunctionRow = visual.functions.length > 0 || connectivity.length > 0;

  if (!hasFunctionRow && visual.specs.length === 0) {
    return null;
  }

  if (variant === 'bar') {
    return (
      <section
        className={cn(
          'rounded-lg border border-border/70 bg-muted/15 px-4 py-4 sm:px-5 sm:py-5',
          className,
        )}
        aria-label="Funciones y especificaciones destacadas"
      >
        {hasFunctionRow ? (
          <div className="flex justify-center border-b border-border/60 pb-3 sm:pb-4">
            <ul className="flex flex-wrap items-end justify-center gap-4 px-1 sm:gap-6">
              {visual.functions.map((item) => (
                <FunctionIcon key={item.label} item={item} />
              ))}
              {connectivity.map((item) => (
                <FunctionIcon key={item.label} item={item} />
              ))}
            </ul>
          </div>
        ) : null}

        {visual.specs.length > 0 ? (
          <ul
            className={cn(
              'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-6',
              hasFunctionRow ? 'mt-4' : '',
            )}
          >
            {visual.specs.map((item) => (
              <SpecIcon
                key={`${item.title}-${item.lines.join('|')}`}
                item={item}
                compact
              />
            ))}
          </ul>
        ) : null}
      </section>
    );
  }

  return (
    <section
      className={cn('py-0.5', className)}
      aria-label="Funciones y especificaciones destacadas"
    >
      {hasFunctionRow ? (
        <div className="flex justify-center border-b border-border/60 pb-2.5">
          <ul className="flex flex-wrap items-end justify-center gap-4 px-1 sm:gap-6 sm:px-2">
            {visual.functions.map((item) => (
              <FunctionIcon key={item.label} item={item} />
            ))}
            {connectivity.map((item) => (
              <FunctionIcon key={item.label} item={item} />
            ))}
          </ul>
        </div>
      ) : null}

      {visual.specs.length > 0 ? (
        <ul className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2.5 sm:gap-x-4">
          {visual.specs.map((item) => (
            <SpecIcon key={`${item.title}-${item.lines.join('|')}`} item={item} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
