import { ProductDetailSpecsTable } from '@/components/product-detail/product-detail-specs-table';
import { cn } from '@/lib/utils';
import type { ProductDescriptionContent, ProductSpecRow } from '@/types/product-detail';

interface ProductDetailDescriptionPanelProps {
  content: ProductDescriptionContent;
  specs: ProductSpecRow[];
  sku?: string | null;
  className?: string;
  showSpecs?: boolean;
  compact?: boolean;
}

export function ProductDetailDescriptionPanel({
  content,
  specs,
  sku,
  className,
  showSpecs = true,
  compact = false,
}: ProductDetailDescriptionPanelProps) {
  const overviewTitle = content.overviewTitle ?? 'Productividad para tu oficina';
  const overviewParagraphs =
    content.overviewParagraphs && content.overviewParagraphs.length > 0
      ? content.overviewParagraphs
      : content.paragraphs.slice(0, 2);
  const highlights = content.highlights.slice(0, 4);

  return (
    <div
      className={cn(
        showSpecs
          ? 'grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start'
          : 'space-y-5',
        className,
      )}
    >
      <div className={cn(compact ? 'space-y-3' : 'space-y-5')}>
        <div className="space-y-1.5">
          <h2
            className={cn(
              'text-balance font-bold leading-tight text-[#0f1f3d]',
              compact ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl',
            )}
          >
            {overviewTitle}
          </h2>
          {sku ? (
            <p
              className={cn(
                'font-mono text-muted-foreground',
                compact ? 'text-[0.65rem] sm:text-xs' : 'text-xs sm:text-sm',
              )}
            >
              {sku}
            </p>
          ) : null}
        </div>

        <div
          className={cn(
            'leading-relaxed text-muted-foreground',
            compact ? 'space-y-2 text-xs sm:text-sm' : 'space-y-3 text-sm sm:text-[0.9375rem]',
          )}
        >
          {overviewParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {highlights.length > 0 ? (
          <ul
            className={cn(
              'grid grid-cols-2 border-t border-border/60',
              compact
                ? 'gap-2 pt-3 sm:grid-cols-4 sm:gap-3'
                : 'gap-3 pt-5 sm:grid-cols-4 sm:gap-4',
            )}
          >
            {highlights.map((highlight) => {
              const Icon = highlight.icon;
              return (
                <li key={highlight.title} className="flex flex-col items-center text-center">
                  <span
                    className={cn(
                      'flex items-center justify-center rounded-full border border-border/70 bg-muted/20 text-muted-foreground',
                      compact ? 'size-8' : 'size-10',
                    )}
                  >
                    <Icon className={cn(compact ? 'size-4' : 'size-5')} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <p
                    className={cn(
                      'mt-1.5 font-bold leading-snug text-[#0f1f3d]',
                      compact ? 'text-[0.65rem] sm:text-xs' : 'text-xs sm:text-sm',
                    )}
                  >
                    {highlight.title}
                  </p>
                  <p
                    className={cn(
                      'mt-0.5 leading-snug text-muted-foreground',
                      compact ? 'text-[0.6rem] sm:text-[0.65rem]' : 'text-[0.65rem] sm:text-xs',
                    )}
                  >
                    {highlight.subtitle}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      {showSpecs ? (
        <aside className="lg:sticky lg:top-24">
          <h3 className="mb-3 text-base font-bold text-[#0f1f3d] sm:text-lg">
            Especificaciones técnicas
          </h3>
          {specs.length > 0 ? (
            <ProductDetailSpecsTable specs={specs} />
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay especificaciones técnicas registradas para este producto.
            </p>
          )}
        </aside>
      ) : null}
    </div>
  );
}
