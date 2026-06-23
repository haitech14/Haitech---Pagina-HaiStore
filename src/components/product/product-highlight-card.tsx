import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageOff } from 'lucide-react';

import { AdminRolePricesTooltip } from '@/components/admin/admin-role-prices-tooltip';
import { CatalogPreviewDualPriceBlock } from '@/components/product/catalog-preview-price-block';
import { isProductOutOfStock } from '@/components/cart/add-to-cart-button';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { DualPrice } from '@/components/product/product-dual-price';
import { ProductCardHoverImage } from '@/components/product/product-card-hover-image';
import { ProductQuantityAddFooter } from '@/components/product/product-quantity-add-footer';
import { useCatalogDisplayPrice } from '@/hooks/use-catalog-display-price';
import { formatHighlightProductTitle } from '@/lib/product-card-title';
import { buildProductImageCandidates } from '@/lib/product-image-url';
import { productPath } from '@/lib/product-path';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

const HIGHLIGHT_TEXT = '#0f1f3d';

const whatsappRevealClass =
  'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-200 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100 max-md:grid-rows-[1fr] max-md:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 motion-reduce:grid-rows-[1fr] motion-reduce:opacity-100 motion-reduce:transition-none';

interface ProductHighlightCardProps {
  product: Product;
}

export function ProductHighlightCard({ product }: ProductHighlightCardProps) {
  const outOfStock = isProductOutOfStock(product);
  const detailHref = productPath(product.id);
  const imageCandidates = useMemo(() => buildProductImageCandidates(product), [product]);
  const [quantity, setQuantity] = useState(1);
  const displayPrice = useCatalogDisplayPrice(product);

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden bg-white',
        'rounded-xl border border-border/50 shadow-[0_1px_6px_rgba(15,31,61,0.06)]',
      )}
    >
      <Link
        to={detailHref}
        className="relative flex aspect-square w-full items-center justify-center bg-white px-2 pt-2 sm:px-3 sm:pt-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
        aria-label={`Ver ficha de ${product.name}`}
      >
        {!outOfStock ? (
          <div className="pointer-events-none absolute left-1.5 top-1.5 z-10 sm:left-2 sm:top-2">
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[0.625rem] font-semibold leading-none shadow-sm sm:text-[0.6875rem]',
                product.stock <= 3
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-emerald-100 text-emerald-800',
              )}
            >
              {product.stock <= 3 ? 'Últimas unidades' : 'En stock'}
            </span>
          </div>
        ) : null}
        <ProductCardHoverImage
          candidates={imageCandidates}
          imageClassName="max-h-[88%] max-w-[88%] object-contain object-center"
          placeholder={
            <div className="relative flex size-full items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/20">
              <img
                src="/categories/multifuncionales.png"
                alt=""
                aria-hidden="true"
                className="size-full object-cover opacity-35"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/25 to-background/70" />
              <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[0.625rem] font-semibold text-primary-foreground shadow-sm sm:text-[0.6875rem]">
                Destacado
              </span>
              <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1 text-foreground/85">
                <ImageOff className="size-3.5" aria-hidden="true" />
                <span className="text-[0.625rem] font-medium sm:text-[0.6875rem]">
                  Imagen referencial
                </span>
              </div>
            </div>
          }
        />
      </Link>

      <div className="flex min-h-0 flex-1 flex-col items-start px-2.5 pb-2.5 pt-0 text-left sm:px-3 sm:pb-3">
        <div className="flex w-full flex-1 flex-col gap-1">
          <Link
            to={detailHref}
            className="w-full rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          >
            <h3
              className="line-clamp-3 min-h-[2.75rem] w-full text-pretty text-[0.6875rem] font-bold normal-case leading-snug sm:min-h-[3.25rem] sm:text-[0.8125rem] sm:leading-snug"
              style={{ color: HIGHLIGHT_TEXT }}
            >
              {formatHighlightProductTitle(product.name)}
            </h3>
          </Link>

          <AdminRolePricesTooltip productId={product.id} displayUsd={displayPrice.priceUsd}>
            <CatalogPreviewDualPriceBlock
              displayPrice={displayPrice}
              alwaysBoth
              badgeClassName="mb-1"
              children={(priceUsd) => (
                <DualPrice
                  alwaysBoth
                  className="min-h-[1.25rem] whitespace-nowrap text-[0.8125rem] font-bold tabular-nums text-[#0f1f3d] sm:min-h-[1.375rem] sm:text-sm"
                  usd={priceUsd}
                />
              )}
            />
          </AdminRolePricesTooltip>
        </div>

        <div className="mt-auto w-full pt-1.5 sm:pt-2">
          <ProductQuantityAddFooter
            product={product}
            size="sm"
            onQuantityChange={setQuantity}
          />

          <div className={whatsappRevealClass}>
            <div className="min-h-0 overflow-hidden">
              <ProductWhatsAppButton
                stopPropagation
                accent="outline"
                label="Comprar por WhatsApp"
                quantity={quantity}
                product={{
                  id: product.id,
                  name: product.name,
                  priceUsd: displayPrice.priceUsd,
                  category: product.category,
                  brand: product.brand ?? null,
                }}
                className="mt-1.5 h-11 min-h-11 w-full rounded-md px-2 text-[0.625rem] font-semibold normal-case tracking-normal sm:text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
