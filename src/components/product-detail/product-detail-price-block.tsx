import { formatUsd, penToUsd, usdToPen } from '@/lib/utils';
import type { ProductDetailViewModel } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductDetailPriceBlockProps {
  product: Product;
  detail: ProductDetailViewModel;
}

export function ProductDetailPriceBlock({ product, detail }: ProductDetailPriceBlockProps) {
  const pricePen = usdToPen(product.price);
  const oldPriceUsd = detail.oldPricePen != null ? penToUsd(detail.oldPricePen) : null;

  return (
    <div className="mb-4 space-y-1 border-b border-neutral-200 pb-4">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        {detail.oldPricePen != null && (
          <span className="text-sm text-neutral-400 line-through">
            S/ {detail.oldPricePen.toLocaleString('es-PE')}
          </span>
        )}
        <span className="text-2xl font-bold leading-none text-neutral-900">
          S/ {pricePen.toLocaleString('es-PE')}
        </span>
        {detail.discountPercent != null && (
          <span className="text-sm font-bold text-red-600">-{detail.discountPercent}%</span>
        )}
      </div>
      <p className="text-xs text-neutral-500">
        {oldPriceUsd != null && (
          <span className="mr-2 line-through">{formatUsd(oldPriceUsd)}</span>
        )}
        <span>{formatUsd(product.price)}</span>
      </p>
    </div>
  );
}
