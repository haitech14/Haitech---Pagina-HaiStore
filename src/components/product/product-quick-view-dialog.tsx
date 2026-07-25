import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { ProductQuickViewActions } from '@/components/product/product-quick-view-actions';
import { ProductVolumeDiscountPromo } from '@/components/product/product-volume-discount-promo';
import { ProductQuickViewExtras } from '@/components/product/product-quick-view-extras';
import { ProductQuickViewFeaturePills } from '@/components/product/product-quick-view-feature-pills';
import { ProductQuickViewFooter } from '@/components/product/product-quick-view-footer';
import { ProductQuickViewGallery } from '@/components/product/product-quick-view-gallery';
import { ProductQuickViewPricingBox } from '@/components/product/product-quick-view-pricing-box';
import { ProductQuickViewServiceCards } from '@/components/product/product-quick-view-service-cards';
import { ProductAttributeBadges } from '@/components/product-attribute-badges';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCatalogDisplayPrice } from '@/hooks/use-catalog-display-price';
import { useProduct } from '@/hooks/use-product';
import { buildProductDetail } from '@/lib/build-product-detail';
import { inventoryCategoryLeafLabel } from '@/lib/inventory-stock-status';
import { getProductCardTitleContent } from '@/lib/product-card-title';
import {
  resolveProductHeroBrand,
  resolveProductHeroCode,
} from '@/lib/product-hero-meta';
import { productPath } from '@/lib/product-path';
import { cn } from '@/lib/utils';
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

function briefDescription(text: string, maxChars = 180): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxChars) return normalized;
  const cut = normalized.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

export function ProductQuickViewDialog({
  snapshot,
  open,
  onOpenChange,
}: ProductQuickViewDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const [rentalMode, setRentalMode] = useState(false);
  const { product, isLoading } = useProduct(open ? snapshot?.id : undefined);

  useEffect(() => {
    setQuantity(1);
    setRentalMode(false);
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
  const rawCategory = detail?.categoryLabel ?? snapshot?.category ?? product?.category ?? null;
  const categoryLabel = detail?.categoryLabel
    ? detail.categoryLabel
    : rawCategory
      ? inventoryCategoryLeafLabel(rawCategory)
      : null;

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
  const briefDescriptionText = descriptionText ? briefDescription(descriptionText) : null;

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
  const showRentalSwitch = detail?.isPrinterEquipment === true;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[94vh] max-w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl lg:max-w-4xl">
        <div className="flex flex-col gap-2 border-b border-border px-4 py-3 pr-12 sm:px-5">
          {showRentalSwitch ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-muted-foreground">Modo Alquiler</span>
              <button
                type="button"
                role="switch"
                aria-checked={rentalMode}
                aria-label="Activar modo alquiler"
                onClick={() => setRentalMode((value) => !value)}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
                  rentalMode ? 'bg-red-600' : 'bg-muted',
                )}
              >
                <span
                  className={cn(
                    'inline-block size-5 rounded-full bg-white shadow transition-transform',
                    rentalMode ? 'translate-x-[1.35rem]' : 'translate-x-0.5',
                  )}
                  aria-hidden="true"
                />
              </button>
            </div>
          ) : null}
          <DialogTitle className="text-base font-semibold text-foreground sm:text-lg">
            Vista rápida
          </DialogTitle>
          <DialogDescription className="sr-only">
            Resumen de {displayName} sin salir del listado.
          </DialogDescription>
        </div>

        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(0,40%)_1fr]">
          <ProductQuickViewGallery
            items={galleryItems}
            productName={displayName}
            className="border-b border-border lg:border-b-0 lg:border-r"
          />

          <div className="flex min-h-0 flex-col overflow-hidden">
            <div className="flex-1 space-y-3.5 overflow-y-auto p-4 sm:space-y-4 sm:p-5">
              <header className="space-y-1.5">
                {eyebrow ? (
                  <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-primary sm:text-xs">
                    {eyebrow}
                  </p>
                ) : null}
                <h2 className="text-pretty text-base font-bold leading-snug text-foreground sm:text-lg lg:text-xl">
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

              {briefDescriptionText ? (
                <section className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground">Descripción</h3>
                  <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                    {briefDescriptionText}
                  </p>
                </section>
              ) : isLoading ? (
                <div className="space-y-2" role="status">
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-10 w-full animate-pulse rounded bg-muted" />
                  <span className="sr-only">Cargando descripción…</span>
                </div>
              ) : null}

              <ProductQuickViewPricingBox
                productId={productId}
                priceUsd={priceUsd}
                {...(oldPriceUsd != null ? { oldPriceUsd } : {})}
                {...(discountPercent != null ? { discountPercent } : {})}
              />

              {detail ? (
                <ProductQuickViewExtras
                  detail={detail}
                  detailHref={detailHref}
                  rentalMode={rentalMode}
                  onClose={() => onOpenChange(false)}
                />
              ) : null}

              {product && !rentalMode ? (
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
                  rentalMode={rentalMode}
                />
              ) : (
                <div className="space-y-2" role="status">
                  <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                  <Button type="button" className="min-h-11 w-full" disabled>
                    Comprar ahora
                  </Button>
                  <Button type="button" variant="outline" className="min-h-11 w-full" disabled>
                    Comprar
                  </Button>
                  <span className="sr-only">Cargando acciones de compra…</span>
                </div>
              )}

              <ProductQuickViewServiceCards />
            </div>
          </div>
        </div>

        <ProductQuickViewFooter />
      </DialogContent>
    </Dialog>
  );
}
