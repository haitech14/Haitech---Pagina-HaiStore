import { ON_REQUEST_STOCK_BADGE_CLASS } from '@/components/cart/add-to-cart-button';
import {
  getProductCardTitleContent,
  PRODUCT_CARD_BRAND_CLASS,
  PRODUCT_CARD_CODE_CLASS,
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

function cardStockClass(outOfStock: boolean, stock: number): string {
  const quantity = outOfStock ? 0 : Math.max(0, Math.floor(Number(stock) || 0));
  if (quantity <= 0) return ON_REQUEST_STOCK_BADGE_CLASS;
  if (quantity <= 3) return 'font-semibold text-amber-800';
  return 'font-semibold text-emerald-700';
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
  const showMetaLine = (!isTable && Boolean(code)) || showStock;

  return (
    <div className={cn(isTable ? 'space-y-0' : 'space-y-0.5 sm:space-y-1', className)}>
      {showBrandLine ? (
        <p className="min-w-0">
          <span className={cn(brandClass, 'block leading-none')}>{brand}</span>
        </p>
      ) : null}
      <h3 className={titleClass}>{title}</h3>
      {showMetaLine ? (
        <div className="mt-0.5 flex min-w-0 items-center justify-between gap-2">
          {code ? (
            <p className={cn(PRODUCT_CARD_CODE_CLASS, 'min-w-0 truncate')}>{code}</p>
          ) : (
            <span className="min-w-0" aria-hidden="true" />
          )}
          {showStock ? (
            <span
              className={cn(
                'shrink-0 text-[0.62rem] font-semibold tabular-nums sm:text-[0.65rem]',
                cardStockClass(outOfStock, stock ?? 0),
              )}
            >
              {formatCardStockLabel(outOfStock, stock ?? 0)}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
