import {
  getProductCardTitleContent,
  PRODUCT_CARD_BRAND_CLASS,
  PRODUCT_CARD_CODE_CLASS,
  PRODUCT_CARD_STOCK_CLASS,
  PRODUCT_CARD_TITLE_CLAMP_CLASS,
  PRODUCT_CARD_TITLE_FEATURED_CLASS,
  PRODUCT_CARD_TITLE_MAIN_CLASS,
} from '@/lib/product-card-title';
import type { ProductBadgeSource } from '@/lib/product-detail-badges';
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
}

function formatCardStockLabel(outOfStock: boolean, stock: number): string {
  const quantity = outOfStock ? 0 : Math.max(0, Math.floor(Number(stock) || 0));
  if (quantity <= 0) return 'A pedido';
  return `${quantity} unids.`;
}

export function ProductCardTitle({
  product,
  className,
  brandTone: _brandTone = 'default',
  variant = 'card',
  stock,
  outOfStock = false,
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
    ? 'line-clamp-2 text-[0.84rem] font-semibold leading-[1.25] text-foreground sm:text-[0.875rem]'
    : isFeatured
      ? cn(PRODUCT_CARD_TITLE_FEATURED_CLASS, PRODUCT_CARD_TITLE_CLAMP_CLASS)
      : cn(PRODUCT_CARD_TITLE_MAIN_CLASS, PRODUCT_CARD_TITLE_CLAMP_CLASS);

  const showBrandLine = Boolean(brand);
  const showStock = stock != null && !isTable;

  return (
    <div className={cn(isTable ? 'space-y-0' : 'space-y-0.5 sm:space-y-1', className)}>
      {showBrandLine ? (
        <p className="min-w-0">
          <span className={cn(brandClass, 'block leading-none')}>{brand}</span>
        </p>
      ) : null}
      <h3 className={titleClass}>
        {title}
        {!isTable && code ? (
          <span className={cn(PRODUCT_CARD_CODE_CLASS, 'inline font-normal')}> ({code})</span>
        ) : null}
      </h3>
      {showStock ? (
        <div className="mt-0.5 flex min-w-0 justify-end">
          <span className={cn(PRODUCT_CARD_STOCK_CLASS, 'tabular-nums')}>
            {formatCardStockLabel(outOfStock, stock ?? 0)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
