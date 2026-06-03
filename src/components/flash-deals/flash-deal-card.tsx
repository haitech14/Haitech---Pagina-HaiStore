import { useState } from 'react';
import { Link } from 'react-router-dom';

import { ProductCardPricing } from '@/components/product/product-card-pricing';
import { ProductCardTitle } from '@/components/product/product-card-title';
import type { FeaturedProduct } from '@/data/featured-products';
import { productPath } from '@/lib/product-path';

interface FlashDealCardProps {
  product: FeaturedProduct;
}

export function FlashDealCard({ product }: FlashDealCardProps) {
  const [imageError, setImageError] = useState(false);
  const detailHref = productPath(product.id);
  const titleSource = {
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand ?? null,
    attributes: product.attributes ?? [],
  };

  return (
    <article className="flex h-full min-h-[17rem] flex-col rounded-lg border border-border bg-card p-3 sm:min-h-[18rem] sm:p-4">
      <Link
        to={detailHref}
        className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
      >
        <div className="relative mb-3 flex aspect-[4/3] items-center justify-center rounded-md bg-muted/40 p-3">
          {!imageError && product.image ? (
            <img
              src={product.image}
              alt=""
              className="max-h-full max-w-full object-contain"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="text-3xl font-bold text-muted-foreground/40" aria-hidden="true">
              {product.name.charAt(0)}
            </span>
          )}
        </div>

        <ProductCardTitle product={titleSource} />

        <div className="mt-auto pt-3">
          <ProductCardPricing
            productId={product.id}
            priceUsd={product.price}
            {...(product.oldPrice != null ? { oldPriceUsd: product.oldPrice } : {})}
            {...(product.discount != null ? { discountPercent: product.discount } : {})}
            penOnly
          />
        </div>
      </Link>
    </article>
  );
}
