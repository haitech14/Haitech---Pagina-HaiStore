import {
  getProductCardTitleContent,
  PRODUCT_CARD_BRAND_CLASS,
  PRODUCT_CARD_TITLE_MAIN_CLASS,
} from '@/lib/product-card-title';
import type { ProductBadgeSource } from '@/lib/product-detail-badges';
import { cn } from '@/lib/utils';

interface ProductCardTitleProps {
  product: ProductBadgeSource & { name: string; category?: string | null };
  className?: string;
}

export function ProductCardTitle({ product, className }: ProductCardTitleProps) {
  const { brand, title } = getProductCardTitleContent(product);

  return (
    <div className={cn('space-y-0.5', className)}>
      {brand ? <p className={PRODUCT_CARD_BRAND_CLASS}>{brand}</p> : null}
      <h3 className={cn(PRODUCT_CARD_TITLE_MAIN_CLASS, 'line-clamp-2 text-pretty')}>{title}</h3>
    </div>
  );
}
