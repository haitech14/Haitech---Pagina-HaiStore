import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { ProductAttributeBadges } from '@/components/product-attribute-badges';
import { ProductCardPricing } from '@/components/product/product-card-pricing';
import { ProductCardTitle } from '@/components/product/product-card-title';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useProduct } from '@/hooks/use-product';
import { buildProductDetail } from '@/lib/build-product-detail';
import { productPath } from '@/lib/product-path';
import type { FeaturedProduct } from '@/data/featured-products';

interface ProductQuickViewDialogProps {
  snapshot: FeaturedProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductQuickViewDialog({
  snapshot,
  open,
  onOpenChange,
}: ProductQuickViewDialogProps) {
  const { product, isLoading } = useProduct(open ? snapshot?.id : undefined);

  const displayName = product?.name ?? snapshot?.name ?? '';
  const displayImage = product?.image_url ?? snapshot?.image ?? null;
  const outOfStock = product ? product.stock <= 0 : false;
  const detailHref = snapshot ? productPath(snapshot.id) : '#';

  const badgeSource = product ?? {
    id: snapshot?.id ?? '',
    name: snapshot?.name ?? '',
    category: snapshot?.category ?? null,
    brand: snapshot?.brand ?? null,
    attributes: snapshot?.attributes ?? [],
  };

  const detail = useMemo(() => {
    if (!product) return null;
    return buildProductDetail(product, snapshot ?? undefined, []);
  }, [product, snapshot]);

  const descriptionText =
    product?.description?.trim() ||
    (detail?.bullets.length ? detail.bullets.join(' · ') : '') ||
    null;

  const priceUsd = product?.price ?? snapshot?.price ?? 0;
  const oldPriceUsd = snapshot?.oldPrice ?? undefined;
  const discountPercent = snapshot?.discount ?? undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-[calc(100%-1rem)] gap-0 overflow-hidden p-0 sm:max-w-4xl lg:max-w-5xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Vista rápida: {displayName}</DialogTitle>
          <DialogDescription>Resumen del producto sin salir del listado.</DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[92vh] overflow-y-auto lg:max-h-[min(88vh,720px)] lg:grid-cols-[minmax(0,42%)_1fr] lg:overflow-hidden">
          <div className="flex items-center justify-center bg-muted/40 p-6 lg:min-h-[min(88vh,720px)] lg:p-8">
            {isLoading && !displayImage ? (
              <div className="aspect-square w-full max-w-[280px] animate-pulse rounded-lg bg-muted" />
            ) : displayImage ? (
              <img
                src={displayImage}
                alt=""
                className="max-h-64 w-full max-w-[320px] object-contain lg:max-h-[min(72vh,560px)] lg:max-w-none"
              />
            ) : (
              <span className="text-5xl font-bold text-muted-foreground" aria-hidden="true">
                {displayName.charAt(0)}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto border-t border-border p-5 sm:p-6 lg:border-l lg:border-t-0 lg:p-8">
            {snapshot?.category || product?.category ? (
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {snapshot?.category ?? product?.category}
              </p>
            ) : null}

            <ProductCardTitle product={badgeSource} />

            <ProductAttributeBadges product={badgeSource} />

            <ProductCardPricing
              productId={snapshot?.id ?? product?.id ?? ''}
              priceUsd={priceUsd}
              featured
              {...(oldPriceUsd != null ? { oldPriceUsd } : {})}
              {...(discountPercent != null ? { discountPercent } : {})}
            />

            {descriptionText ? (
              <div className="space-y-2 border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-foreground">Descripción</h3>
                <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                  {descriptionText}
                </p>
              </div>
            ) : isLoading ? (
              <div className="space-y-2 border-t border-border pt-4" role="status">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-16 w-full animate-pulse rounded bg-muted" />
                <span className="sr-only">Cargando descripción…</span>
              </div>
            ) : null}

            <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4 sm:flex-row">
              {product ? (
                <AddToCartButton
                  product={product}
                  disabled={outOfStock}
                  className="min-h-11 flex-1 bg-red-600 hover:bg-red-500"
                >
                  Añadir al carrito
                </AddToCartButton>
              ) : (
                <Button type="button" className="min-h-11 flex-1" disabled>
                  Añadir al carrito
                </Button>
              )}
              <Button type="button" variant="outline" className="min-h-11 flex-1" asChild>
                <Link to={detailHref} onClick={() => onOpenChange(false)}>
                  Ver ficha completa
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
