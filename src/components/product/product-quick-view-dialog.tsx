import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductQuickViewActions } from '@/components/product/product-quick-view-actions';
import { ProductVolumeDiscountPromo } from '@/components/product/product-volume-discount-promo';
import { ProductQuickViewFeaturePills } from '@/components/product/product-quick-view-feature-pills';
import { ProductQuickViewFooter } from '@/components/product/product-quick-view-footer';
import { ProductQuickViewGallery } from '@/components/product/product-quick-view-gallery';
import { ProductQuickViewPricingBox } from '@/components/product/product-quick-view-pricing-box';
import { ProductQuickViewServiceCards } from '@/components/product/product-quick-view-service-cards';
import { ProductAttributeBadges } from '@/components/product-attribute-badges';
import { useCatalogDisplayPrice } from '@/hooks/use-catalog-display-price';
import { useProduct } from '@/hooks/use-product';
import { buildProductDetail } from '@/lib/build-product-detail';
import { getProductCardTitleContent } from '@/lib/product-card-title';
import {
  resolveProductHeroBrand,
  resolveProductHeroCode,
} from '@/lib/product-hero-meta';
import { productPath } from '@/lib/product-path';
import type { FeaturedProduct } from '@/data/featured-products';
import type { ProductGalleryItem } from '@/types/product-detail';

interface ProductQuickViewDialogProps {
  snapshot: FeaturedProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function snapshotGalleryItems(image: string | null | undefined, name: string): ProductGalleryItem[] {
  if (!image) return [];
  return [{ type: 'image', src: image, alt: name }];
}

export function ProductQuickViewDialog({
  snapshot,
  open,
  onOpenChange,
}: ProductQuickViewDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const { product, isLoading } = useProduct(open ? snapshot?.id : undefined);

  useEffect(() => {
    setQuantity(1);
  }, [product?.id, snapshot?.id]);

  const badgeSource = product ?? {
    id: snapshot?.id ?? '',
    name: snapshot?.name ?? '',
    category: snapshot?.category ?? null,
    brand: snapshot?.brand ?? null,
    code: snapshot?.code ?? null,
    attributes: snapshot?.attributes ?? [],
  };

  const detail = useMemo(() => {
    if (!product) return null;
    return buildProductDetail(product, snapshot ?? undefined, []);
  }, [product, snapshot]);

  const brand = resolveProductHeroBrand(badgeSource) ?? getProductCardTitleContent(badgeSource).brand;
  const code = product
    ? resolveProductHeroCode(product)
    : getProductCardTitleContent(badgeSource).code;
  const title = detail?.heroTitle ?? getProductCardTitleContent(badgeSource).title;
  const categoryLabel = detail?.categoryLabel ?? snapshot?.category ?? product?.category ?? null;

  const displayName = product?.name ?? snapshot?.name ?? title;
  const detailHref = product
    ? productPath(product)
    : snapshot
      ? productPath({ id: snapshot.id, name: snapshot.name })
      : '#';

  const galleryItems = useMemo(() => {
    if (detail?.gallery.length) return detail.gallery;
    return snapshotGalleryItems(product?.image_url ?? snapshot?.image, displayName);
  }, [detail?.gallery, product?.image_url, snapshot?.image, displayName]);

  const descriptionText =
    detail?.heroDescription?.trim() ||
    product?.description?.trim() ||
    (detail?.bullets.length ? detail.bullets.slice(0, 2).join(' ') : '') ||
    null;

  const priceSource = useMemo(() => {
    const prices = product?.prices ?? snapshot?.prices;
    return {
      price: product?.price ?? snapshot?.price ?? 0,
      ...(prices ? { prices } : {}),
      ...(snapshot?.price_role ? { price_role: snapshot.price_role } : {}),
    };
  }, [product, snapshot]);
  const displayPrice = useCatalogDisplayPrice(priceSource);
  const priceUsd = displayPrice.priceUsd;
  const oldPriceUsd = snapshot?.oldPrice ?? undefined;
  const discountPercent = snapshot?.discount ?? undefined;
  const productId = snapshot?.id ?? product?.id ?? '';

  const eyebrow = [categoryLabel, brand].filter(Boolean).join(' • ');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[94vh] max-w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl lg:max-w-6xl">
        <div className="flex items-center border-b border-border px-4 py-3 pr-12 sm:px-6">
          <DialogTitle className="text-base font-semibold text-foreground sm:text-lg">
            Vista rápida
          </DialogTitle>
          <DialogDescription className="sr-only">
            Resumen de {displayName} sin salir del listado.
          </DialogDescription>
        </div>

        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(0,44%)_1fr]">
          <ProductQuickViewGallery
            items={galleryItems}
            productName={displayName}
            className="border-b border-border lg:border-b-0 lg:border-r"
          />

          <div className="flex min-h-0 flex-col overflow-hidden">
            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:space-y-5 sm:p-6">
              <header className="space-y-2">
                {eyebrow ? (
                  <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-primary sm:text-xs">
                    {eyebrow}
                  </p>
                ) : null}
                <h2 className="text-pretty text-lg font-bold leading-snug text-foreground sm:text-xl lg:text-2xl">
                  {title}
                </h2>
                {code ? (
                  <p className="text-sm text-muted-foreground">
                    Código:{' '}
                    <span className="font-mono font-medium text-foreground">{code}</span>
                  </p>
                ) : null}
              </header>

              {detail?.featureBar.length ? (
                <ProductQuickViewFeaturePills items={detail.featureBar} />
              ) : (
                <ProductAttributeBadges product={badgeSource} hideBrand className="gap-1.5" />
              )}

              <ProductQuickViewPricingBox
                productId={productId}
                priceUsd={priceUsd}
                {...(oldPriceUsd != null ? { oldPriceUsd } : {})}
                {...(discountPercent != null ? { discountPercent } : {})}
              />

              {product ? (
                <ProductVolumeDiscountPromo
                  product={product}
                  quantity={quantity}
                  {...(detail?.bulkDiscountTiers ? { tiers: detail.bulkDiscountTiers } : {})}
                  className="mt-1"
                />
              ) : null}

              {product ? (
                <ProductQuickViewActions
                  product={product}
                  detailHref={detailHref}
                  onClose={() => onOpenChange(false)}
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                />
              ) : (
                <div className="space-y-2" role="status">
                  <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                  <Button type="button" className="min-h-11 w-full" disabled>
                    Comprar ahora
                  </Button>
                  <Button type="button" variant="outline" className="min-h-11 w-full" disabled>
                    Añadir al carrito
                  </Button>
                  <span className="sr-only">Cargando acciones de compra…</span>
                </div>
              )}

              {descriptionText ? (
                <section className="space-y-2 border-t border-border pt-4">
                  <h3 className="text-sm font-bold text-foreground">Descripción</h3>
                  <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                    {descriptionText}
                  </p>
                </section>
              ) : isLoading ? (
                <div className="space-y-2 border-t border-border pt-4" role="status">
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-14 w-full animate-pulse rounded bg-muted" />
                  <span className="sr-only">Cargando descripción…</span>
                </div>
              ) : null}

              <ProductQuickViewServiceCards />
            </div>
          </div>
        </div>

        <ProductQuickViewFooter />
      </DialogContent>
    </Dialog>
  );
}
