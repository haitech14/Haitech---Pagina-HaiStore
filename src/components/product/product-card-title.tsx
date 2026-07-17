import { Package } from 'lucide-react';

import {
  getProductCardTitleContent,
  PRODUCT_CARD_BRAND_CLASS,
  PRODUCT_CARD_BRAND_ROW_CLASS,
  PRODUCT_CARD_CODE_CLASS,
  PRODUCT_CARD_STOCK_CLASS,
  PRODUCT_CARD_TITLE_CLAMP_CLASS,
  PRODUCT_CARD_TITLE_FEATURED_CLASS,
  PRODUCT_CARD_TITLE_MAIN_CLASS,
} from '@/lib/product-card-title';
import { ProductCardEstadoBadge } from '@/components/product/product-card-estado-badge';
import { resolveProductCardBadgeLabel } from '@/lib/product-card-condition';
import type { ProductBadgeSource } from '@/lib/product-detail-badges';
import { PRODUCT_ON_REQUEST_STOCK_LABEL } from '@/lib/product-on-request-label';
import { cn } from '@/lib/utils';

interface ProductCardTitleProps {
  product: ProductBadgeSource & { name: string; category?: string | null };
  className?: string;
  /** @deprecated El tono accent ya no altera el estilo; la marca siempre es gris. */
  brandTone?: 'default' | 'accent';
  /** Vista tabla de catálogo: tipografía compacta tipo hoja de cálculo. */
  variant?: 'card' | 'table' | 'featured';
  stock?: number;
  outOfStock?: boolean;
  /** Mostrar badge de condición junto a la marca (grilla de catálogo). */
  showConditionBadge?: boolean;
}

function formatCardStockLabel(outOfStock: boolean, stock: number): string {
  const quantity = outOfStock ? 0 : Math.max(0, Math.floor(Number(stock) || 0));
  if (quantity <= 0) return PRODUCT_ON_REQUEST_STOCK_LABEL;
  return `${quantity} unids.`;
}

interface ProductCardBrandLineProps {
  brand: string | null;
  conditionLabel?: string | null;
  brandClassName?: string;
}

/** Marca y badge de condición en la misma fila (p. ej. RICOH + Nueva). */
export function ProductCardBrandLine({
  brand,
  conditionLabel,
  brandClassName,
}: ProductCardBrandLineProps) {
  const trimmedLabel = conditionLabel?.trim();
  if (!brand && !trimmedLabel) return null;

  return (
    <div className={PRODUCT_CARD_BRAND_ROW_CLASS}>
      {brand ? (
        <p className={cn(PRODUCT_CARD_BRAND_CLASS, 'min-w-0 shrink truncate leading-none', brandClassName)}>
          {brand}
        </p>
      ) : null}
      {trimmedLabel ? <ProductCardEstadoBadge label={trimmedLabel} /> : null}
    </div>
  );
}

export function ProductCardTitle({
  product,
  className,
  brandTone: _brandTone = 'default',
  variant = 'card',
  stock,
  outOfStock = false,
  showConditionBadge = false,
}: ProductCardTitleProps) {
  const { brand, code, title } = getProductCardTitleContent(product);
  const isTable = variant === 'table';
  const isFeatured = variant === 'featured';
  const brandClass = cn(
    isTable
      ? 'truncate text-[0.65rem] font-normal uppercase tracking-wide text-muted-foreground sm:text-[0.7rem]'
      : PRODUCT_CARD_BRAND_CLASS,
  );
  const titleClass = isTable
    ? 'line-clamp-2 text-[0.84rem] font-normal leading-[1.25] text-foreground sm:text-[0.875rem]'
    : isFeatured
      ? cn(PRODUCT_CARD_TITLE_FEATURED_CLASS, PRODUCT_CARD_TITLE_CLAMP_CLASS)
      : cn(PRODUCT_CARD_TITLE_MAIN_CLASS, PRODUCT_CARD_TITLE_CLAMP_CLASS);

  const conditionLabel =
    showConditionBadge && !isTable ? resolveProductCardBadgeLabel(product) : null;
  const showStock = stock != null && !isTable;
  const showCodeStockRow = !isTable && (Boolean(code) || showStock);

  return (
    <div className={cn(isTable ? 'space-y-0' : 'space-y-0.5 sm:space-y-1', className)}>
      <ProductCardBrandLine
        brand={brand}
        conditionLabel={conditionLabel}
        brandClassName={brandClass}
      />
      <h3 className={titleClass}>{title}</h3>
      {showCodeStockRow ? (
        <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
          {code ? <span className={PRODUCT_CARD_CODE_CLASS}>{code}</span> : null}
          {code && showStock ? (
            <span className={cn(PRODUCT_CARD_STOCK_CLASS, 'select-none')} aria-hidden="true">
              -
            </span>
          ) : null}
          {showStock ? (
            <span className={cn(PRODUCT_CARD_STOCK_CLASS, 'inline-flex items-center gap-1 tabular-nums')}>
              {!outOfStock ? (
                <Package className="size-3 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              ) : null}
              {formatCardStockLabel(outOfStock, stock ?? 0)}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
