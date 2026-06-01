import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

import { ProductAttributeBadges } from '@/components/product-attribute-badges';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
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
  const { addItem } = useCart();
  const { role } = useAuth();
  const outOfStock = product.stock <= 0;
  const priceRole = resolveDisplayPriceRole(role, product.price_role);
  const detailHref = productPath(product.id);

  return (
    <Card className="flex flex-col">
      <Link
        to={detailHref}
        className="flex flex-1 flex-col rounded-t-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        <CardHeader>
          <div
            className={cn(
              'mb-3 flex aspect-video items-center justify-center rounded-lg bg-muted text-3xl font-bold text-muted-foreground',
            )}
            aria-hidden={product.image_url ? undefined : true}
          >
            {product.image_url ? (
              <img
                src={product.image_url}
                alt=""
                className="max-h-full max-w-full object-contain p-2"
                loading="lazy"
              />
            ) : (
              product.name.charAt(0)
            )}
          </div>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1 space-y-1.5">
              <CardTitle className="text-base transition-colors hover:text-red-600">
                {product.name}
              </CardTitle>
              <ProductAttributeBadges product={product} compact />
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              {product.brand && (
                <span className="text-xs font-semibold text-[#DC2626]">{product.brand}</span>
              )}
              {product.category && <Badge variant="secondary">{product.category}</Badge>}
            </div>
          </div>
          {product.description && (
            <CardDescription>{product.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="mt-auto space-y-2">
          <Badge variant="outline" className="text-xs">
            Precio {PRICE_ROLE_LABELS[priceRole]}
          </Badge>
          <p className="text-lg font-bold sm:text-xl">
            <DualPrice usd={product.price} />
          </p>
          <p className={cn('text-sm', outOfStock ? 'text-destructive' : 'text-muted-foreground')}>
            {outOfStock ? 'Sin stock' : `${product.stock} disponibles`}
          </p>
        </CardContent>
      </Link>
      <CardFooter className="flex gap-2">
        <Button
          className="min-h-11 flex-1 bg-red-600 hover:bg-red-500"
          onClick={() => addItem(product)}
          disabled={outOfStock}
        >
          <Plus aria-hidden="true" />
          Añadir al carrito
        </Button>
        <ProductWhatsAppButton
          product={{
            id: product.id,
            name: product.name,
            priceUsd: product.price,
            category: product.category,
            brand: product.brand,
          }}
        />
      </CardFooter>
    </Card>
  );
}
