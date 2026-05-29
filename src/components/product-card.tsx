import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

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
import { getBrandFilterHref } from '@/data/brands';
import { useCart } from '@/context/cart-context';
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

  return (
    <Card className="flex flex-col">
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
          <CardTitle className="text-base">{product.name}</CardTitle>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {product.brand && (
              <Link
                to={getBrandFilterHref({ name: product.brand, logo: '' })}
                className="text-xs font-semibold text-[#DC2626] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                {product.brand}
              </Link>
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
      <CardFooter>
        <Button
          className="w-full bg-red-600 hover:bg-red-500"
          onClick={() => addItem(product)}
          disabled={outOfStock}
        >
          <Plus aria-hidden="true" />
          Añadir al carrito
        </Button>
      </CardFooter>
    </Card>
  );
}
