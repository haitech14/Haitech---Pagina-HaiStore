import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

import { ProductAttributeBadges } from '@/components/product-attribute-badges';
import { DualPrice } from '@/components/product-showcase-card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCart } from '@/context/cart-context';
import { useProduct } from '@/hooks/use-product';
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
  const { addItem } = useCart();
  const { product, isLoading } = useProduct(open ? snapshot?.id : undefined);

  const displayName = product?.name ?? snapshot?.name ?? '';
  const displayPrice = product?.price ?? snapshot?.price ?? 0;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-lg gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Vista rápida: {displayName}</DialogTitle>
          <DialogDescription>Resumen del producto sin salir del listado.</DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[92vh] flex-col overflow-y-auto">
          <div className="flex items-center justify-center bg-muted/40 p-6">
            {isLoading && !displayImage ? (
              <div className="aspect-square w-full max-w-[240px] animate-pulse rounded-lg bg-muted" />
            ) : displayImage ? (
              <img
                src={displayImage}
                alt=""
                className="max-h-56 w-full max-w-[280px] object-contain"
              />
            ) : (
              <span className="text-5xl font-bold text-muted-foreground" aria-hidden="true">
                {displayName.charAt(0)}
              </span>
            )}
          </div>

          <div className="space-y-4 p-5">
            {snapshot?.category ? (
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {snapshot.category}
              </p>
            ) : null}
            <h2 className="text-balance text-lg font-bold">{displayName}</h2>
            <ProductAttributeBadges product={badgeSource} />
            <p className="text-xl font-bold">
              <DualPrice usd={displayPrice} />
            </p>
            {product?.description ? (
              <p className="line-clamp-4 text-sm text-muted-foreground">{product.description}</p>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                className="min-h-11 flex-1 bg-red-600 hover:bg-red-500"
                disabled={outOfStock || !product}
                onClick={() => {
                  if (product) addItem(product);
                }}
              >
                <Plus className="size-4" aria-hidden="true" />
                Añadir al carrito
              </Button>
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
