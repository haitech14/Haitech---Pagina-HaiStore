import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { ProductCardPricing } from '@/components/product/product-card-pricing';
import { ProductCardTitle } from '@/components/product/product-card-title';
import { ProductNuevoCornerBadge } from '@/components/product/product-nuevo-corner-badge';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { productHasNuevoCornerBadge } from '@/lib/product-detail-badges';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { productPath } from '@/lib/product-path';
import { resolveDisplayPriceRole } from '@/lib/pricing';
import { cn } from '@/lib/utils';
import { PRICE_ROLE_LABELS, type Product } from '@/types/product';

const cartRevealClass =
  'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-200 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100 max-md:grid-rows-[1fr] max-md:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100';

export function ProductCard({ product }: { product: Product }) {
  const { role } = useAuth();
  const outOfStock = product.stock <= 0;
  const priceRole = resolveDisplayPriceRole(role, product.price_role);
  const detailHref = productPath(product.id);
  const imageUrl = resolveProductImageUrl(product);
  const showNuevoCorner = productHasNuevoCornerBadge(product);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
      <div className="relative flex flex-1 flex-col">
        <Link
          to={detailHref}
          className="absolute inset-0 z-[1] rounded-t-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          aria-label={`Ver ficha de ${product.name}`}
        >
          <span className="sr-only">Ver ficha de {product.name}</span>
        </Link>

        <div className="pointer-events-none relative z-0 flex flex-1 flex-col">
          <div className="relative px-4 pt-4">
            {showNuevoCorner ? (
              <div className="pointer-events-none absolute left-7 top-7 z-[2]">
                <ProductNuevoCornerBadge />
              </div>
            ) : null}
            <div
              className="flex aspect-[4/3] items-center justify-center rounded-lg bg-muted/50 sm:aspect-square"
              aria-hidden={imageUrl ? undefined : true}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt=""
                  className="max-h-full max-w-full object-contain p-3"
                  loading="lazy"
                />
              ) : (
                <span className="text-3xl font-bold text-muted-foreground">{product.name.charAt(0)}</span>
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-1 px-4 pt-2">
            <ProductCardTitle product={product} />

            <div className="mt-auto space-y-1 pb-3 pt-0.5">
              <Badge variant="outline" className="w-fit text-[0.65rem] font-medium">
                Precio {PRICE_ROLE_LABELS[priceRole]}
              </Badge>
              <ProductCardPricing productId={product.id} priceUsd={product.price} />
              <p className={cn('text-xs', outOfStock ? 'text-destructive' : 'text-muted-foreground')}>
                {outOfStock ? 'Sin stock' : `${product.stock} disponibles`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={cn('relative z-10', cartRevealClass)}>
        <div className="min-h-0 overflow-hidden">
          <div className="flex items-stretch gap-2 border-t border-border/60 px-4 pb-4 pt-3">
            <AddToCartButton
              product={product}
              disabled={outOfStock}
              className="min-h-11 flex-1 rounded-lg bg-red-600 px-2 text-xs font-semibold hover:bg-red-500 sm:text-sm lg:px-2.5"
            >
              <ShoppingCart className="size-4 shrink-0" aria-hidden="true" />
              Añadir al carrito
            </AddToCartButton>
            <ProductWhatsAppButton
              className="size-11 shrink-0 rounded-lg"
              product={{
                id: product.id,
                name: product.name,
                priceUsd: product.price,
                category: product.category,
                brand: product.brand ?? null,
              }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
