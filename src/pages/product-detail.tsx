import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Plus, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import { useProduct } from '@/hooks/use-product';
import { resolveDisplayPriceRole } from '@/lib/pricing';
import { cn, formatPenFromUsd, formatUsd } from '@/lib/utils';
import { PRICE_ROLE_LABELS } from '@/types/product';

function DualPrice({ usd, className }: { usd: number; className?: string }) {
  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-2', className)}>
      <span>{formatUsd(usd)}</span>
      <span aria-hidden="true" className="text-muted-foreground">
        ·
      </span>
      <span>{formatPenFromUsd(usd)}</span>
    </span>
  );
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { product, featuredMeta, isLoading, notFound } = useProduct(id);
  const { addItem } = useCart();
  const { role } = useAuth();
  const [imageError, setImageError] = useState(false);

  if (isLoading) {
    return (
      <div className="container py-8" role="status" aria-live="polite">
        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-xl bg-muted" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-12 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
        <span className="sr-only">Cargando producto…</span>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center gap-4 py-8 text-center">
        <h1 className="text-2xl font-semibold">Producto no encontrado</h1>
        <p className="text-muted-foreground">
          El artículo que buscas no está disponible o el enlace no es válido.
        </p>
        <Button asChild className="bg-red-600 hover:bg-red-500">
          <Link to="/tienda">Volver a la tienda</Link>
        </Button>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const priceRole = resolveDisplayPriceRole(role, product.price_role);

  return (
    <div className="container py-6 sm:py-8">
      <nav aria-label="Migas de pan" className="mb-6">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link
              to="/tienda"
              className="inline-flex items-center gap-1 font-medium text-red-600 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              Tienda
            </Link>
          </li>
          {product.category && (
            <>
              <li aria-hidden="true">/</li>
              <li>{product.category}</li>
            </>
          )}
          <li aria-hidden="true">/</li>
          <li className="text-foreground">{product.name}</li>
        </ol>
      </nav>

      <article className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="relative overflow-hidden rounded-xl border border-border/80 bg-muted/30">
          <div className="flex aspect-square items-center justify-center p-6 sm:p-10">
            {product.image_url && !imageError ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-6xl font-bold text-muted-foreground/40" aria-hidden="true">
                {product.name.charAt(0)}
              </span>
            )}
          </div>

          <div className="absolute left-4 top-4 flex flex-col gap-1">
            {featuredMeta?.discount != null && (
              <span className="rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                -{featuredMeta.discount}%
              </span>
            )}
            {featuredMeta?.isNew && (
              <span className="rounded-md bg-foreground px-2 py-0.5 text-xs font-bold text-background">
                Nuevo
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {product.category && (
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {product.category}
            </p>
          )}
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{product.name}</h1>

          {featuredMeta && (
            <div
              className="flex items-center gap-1"
              aria-label={`Valoración ${featuredMeta.rating} de 5, ${featuredMeta.reviews} reseñas`}
            >
              <div className="flex" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      'size-4',
                      index < featuredMeta.rating
                        ? 'fill-red-500 text-red-500'
                        : 'fill-muted text-muted',
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({featuredMeta.reviews})</span>
            </div>
          )}

          {product.brand && (
            <p className="text-sm">
              Marca:{' '}
              <span className="font-semibold text-[#DC2626]">{product.brand}</span>
            </p>
          )}

          {product.description && (
            <p className="text-muted-foreground">{product.description}</p>
          )}

          <div className="space-y-1">
            <Badge variant="outline" className="w-fit text-xs">
              Precio {PRICE_ROLE_LABELS[priceRole]}
            </Badge>
            <p className="text-2xl font-bold sm:text-3xl">
              <DualPrice usd={product.price} />
            </p>
            {featuredMeta?.oldPrice != null && (
              <p className="text-base text-muted-foreground line-through">
                <DualPrice usd={featuredMeta.oldPrice} />
              </p>
            )}
            <p className={cn('text-sm', outOfStock ? 'text-destructive' : 'text-muted-foreground')}>
              {outOfStock ? 'Sin stock' : `${product.stock} disponibles`}
            </p>
          </div>

          <Button
            size="lg"
            className="mt-2 w-full bg-red-600 hover:bg-red-500 sm:w-auto sm:min-w-[220px]"
            onClick={() => addItem(product)}
            disabled={outOfStock}
          >
            <Plus aria-hidden="true" />
            Añadir al carrito
          </Button>
        </div>
      </article>
    </div>
  );
}
