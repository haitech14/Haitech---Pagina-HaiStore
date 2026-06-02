import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { ProductAttributeBadges } from '@/components/product-attribute-badges';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { productPath } from '@/lib/product-path';
import { resolveDisplayPriceRole } from '@/lib/pricing';
import { cn, formatPenFromUsd, formatUsd } from '@/lib/utils';
import { PRICE_ROLE_LABELS, type Product } from '@/types/product';

function DualPrice({ usd, className }: { usd: number; className?: string }) {
  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-1.5', className)}>
      <span>{formatUsd(usd)}</span>
      <span aria-hidden="true" className="text-muted-foreground">
        ·
      </span>
      <span>{formatPenFromUsd(usd)}</span>
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { role } = useAuth();
  const outOfStock = product.stock <= 0;
  const priceRole = resolveDisplayPriceRole(role, product.price_role);
  const detailHref = productPath(product.id);
  const imageUrl = resolveProductImageUrl(product);

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <Link
        to={detailHref}
        className="flex flex-1 flex-col rounded-t-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
      >
        <div className="px-4 pt-4">
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

        <CardHeader className="flex flex-1 flex-col gap-2 space-y-0 px-4 pb-2 pt-3">
          <div className="flex items-start justify-between gap-2">
            {product.category ? (
              <Badge
                variant="secondary"
                className="max-w-[72%] truncate rounded-md px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide"
                title={product.category}
              >
                {product.category}
              </Badge>
            ) : (
              <span aria-hidden="true" />
            )}
            {product.brand ? (
              <span className="shrink-0 text-xs font-semibold text-[#DC2626]">{product.brand}</span>
            ) : null}
          </div>

          <CardTitle className="line-clamp-2 text-balance text-sm font-bold leading-snug text-foreground sm:text-[0.95rem]">
            {product.name}
          </CardTitle>

          <ProductAttributeBadges product={product} compact />
        </CardHeader>

        <CardContent className="mt-auto space-y-1.5 px-4 pb-3 pt-0">
          <Badge variant="outline" className="text-[0.65rem] font-medium">
            Precio {PRICE_ROLE_LABELS[priceRole]}
          </Badge>
          <p className="text-base font-bold leading-tight sm:text-lg">
            <DualPrice usd={product.price} />
          </p>
          <p className={cn('text-xs', outOfStock ? 'text-destructive' : 'text-muted-foreground')}>
            {outOfStock ? 'Sin stock' : `${product.stock} disponibles`}
          </p>
        </CardContent>
      </Link>

      <CardFooter className="mt-auto gap-2 border-t border-border/60 px-4 pb-4 pt-3">
        <AddToCartButton
          product={product}
          disabled={outOfStock}
          className="min-h-11 flex-1 bg-red-600 px-2 text-xs hover:bg-red-500 sm:text-sm lg:px-2.5"
        >
          <ShoppingCart className="size-4 shrink-0" aria-hidden="true" />
          <span className="lg:hidden">Añadir al carrito</span>
          <span className="hidden lg:inline">Añadir</span>
        </AddToCartButton>
        <ProductWhatsAppButton
          className="size-11 shrink-0"
          product={{
            id: product.id,
            name: product.name,
            priceUsd: product.price,
            category: product.category,
            brand: product.brand ?? null,
          }}
        />
      </CardFooter>
    </Card>
  );
}
