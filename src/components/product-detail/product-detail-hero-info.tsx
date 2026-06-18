import { useMemo, type ReactNode, type RefObject } from 'react';
import {
  ClipboardList,
  Clock,
  Heart,
  Minus,
  Plus,
  Shield,
  ShoppingCart,
  Star,
  Truck,
} from 'lucide-react';
import { toast } from 'sonner';

import { AddToCartButton, isProductOutOfStock } from '@/components/cart/add-to-cart-button';
import { ProductBulkDiscountTable } from '@/components/product-detail/product-bulk-discount-table';
import { TechnicalSheetDownloadLink } from '@/components/product-detail/technical-sheet-download-link';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';
import { ensureFullPrices } from '@/lib/roles';
import { resolveProductCardPricing } from '@/lib/product-card-pricing';
import { resolveBulkDiscountPricing, resolveBulkDiscountSavingsHint } from '@/lib/bulk-discount-tiers';
import { cn, formatPenFromUsdPrecise, formatUsd, penToUsd, usdToPen } from '@/lib/utils';
import { productToWishlistItem } from '@/lib/wishlist-product';
import type { ProductDetailViewModel } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductDetailHeroInfoProps {
  product: Product;
  detail: ProductDetailViewModel;
  onQuoteClick?: () => void;
  comboSlot?: ReactNode;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  purchaseActionsRef?: RefObject<HTMLDivElement | null>;
}

const actionRowItemClassName =
  'flex min-w-0 flex-1 items-center justify-center gap-1 px-0.5 text-center text-[0.65rem] font-medium text-[#0f1f3d] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:gap-1.5 sm:text-xs';

export function ProductDetailHeroInfo({
  product,
  detail,
  onQuoteClick,
  comboSlot,
  quantity,
  onQuantityChange,
  purchaseActionsRef,
}: ProductDetailHeroInfoProps) {
  const { addItem } = useCart();
  const { isSelected: isWishlistSelected, toggle: toggleWishlist } = useWishlist();

  const fullPrices = useMemo(
    () => ensureFullPrices(product.prices ? product.prices : { public: product.price }),
    [product.price, product.prices],
  );
  const displayUsd = fullPrices.public;
  const pricing = useMemo(() => {
    const oldFromPen =
      detail.oldPricePen != null && detail.oldPricePen > usdToPen(displayUsd)
        ? { oldPrice: penToUsd(detail.oldPricePen) }
        : {};
    return resolveProductCardPricing(product.id, displayUsd, {
      ...oldFromPen,
      ...(detail.discountPercent != null ? { discount: detail.discountPercent } : {}),
    });
  }, [product.id, displayUsd, detail.discountPercent, detail.oldPricePen]);
  const showComparePrice = pricing.compareUsd > displayUsd;
  const currentPen = usdToPen(displayUsd);
  const previousPen =
    detail.oldPricePen ?? (showComparePrice ? usdToPen(pricing.compareUsd) : null);
  const hasSavings = previousPen != null && previousPen > currentPen + 0.01;
  const savingsPen = hasSavings ? previousPen - currentPen : 0;
  const volumePricing = useMemo(
    () =>
      resolveBulkDiscountPricing(quantity, displayUsd, detail.bulkDiscountTiers, {
        floorPriceUsd: fullPrices.tecnico,
      }),
    [quantity, displayUsd, detail.bulkDiscountTiers, fullPrices.tecnico],
  );
  const hasVolumeDiscount = volumePricing.tier != null && volumePricing.savingsUsd > 0.001;
  const volumeSavingsHint = useMemo(
    () =>
      detail.bulkDiscountTiers.length > 0
        ? resolveBulkDiscountSavingsHint(quantity, displayUsd, detail.bulkDiscountTiers, {
            floorPriceUsd: fullPrices.tecnico,
          })
        : null,
    [quantity, displayUsd, detail.bulkDiscountTiers, fullPrices.tecnico],
  );
  const savingsMessage = useMemo(() => {
    if (volumeSavingsHint) {
      const amount = formatPenFromUsdPrecise(volumeSavingsHint.savingsUsd);
      return volumeSavingsHint.isActive
        ? `Ahorras ${amount} con ${volumeSavingsHint.targetQuantity} ud.`
        : `Si llevas ${volumeSavingsHint.targetQuantity} ud. puedes ahorrar ${amount}`;
    }
    if (hasSavings) {
      return `Ahorras S/ ${savingsPen.toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} por unidad`;
    }
    return null;
  }, [volumeSavingsHint, hasSavings, savingsPen]);
  const showStruckNormalPrice =
    hasVolumeDiscount ||
    hasSavings ||
    detail.bulkDiscountTiers.length > 0 ||
    volumePricing.unitUsd < displayUsd - 0.001;
  const normalPriceLabel = useMemo(() => {
    if (hasSavings && !hasVolumeDiscount && previousPen != null) {
      return `S/ ${previousPen.toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} / ud.`;
    }
    return `${formatPenFromUsdPrecise(displayUsd)} / ud.`;
  }, [hasSavings, hasVolumeDiscount, previousPen, displayUsd]);
  const cartAddOptions = useMemo(
    () => ({
      quantity,
      ...(hasVolumeDiscount ? { volumeUnitPriceUsd: volumePricing.unitUsd } : {}),
    }),
    [quantity, hasVolumeDiscount, volumePricing.unitUsd],
  );
  const outOfStock = isProductOutOfStock(product);
  const stockDisplay = outOfStock ? 0 : product.stock;
  const maxQuantity = outOfStock ? 1 : Math.max(1, stockDisplay || 99);

  const adjustQuantity = (delta: number) => {
    onQuantityChange(Math.max(1, Math.min(maxQuantity, quantity + delta)));
  };

  const handleBuyNow = () => {
    if (outOfStock) return;
    addItem(product, { ...cartAddOptions, openDrawer: true });
  };

  const wishlistSelected = isWishlistSelected(product.id);

  const handleWishlist = () => {
    toggleWishlist(productToWishlistItem(product));
    if (!wishlistSelected) {
      toast.success('Agregado a tu lista');
    }
  };

  const displayRating = Number(detail.rating.toFixed(1));
  const fullStars = Math.min(5, Math.max(0, Math.round(displayRating)));

  return (
    <div className="flex min-w-0 max-w-lg flex-col xl:max-w-xl">
      <h1 className="text-pretty text-xl font-bold leading-snug text-[#0f1f3d] sm:text-2xl lg:text-[1.65rem] lg:leading-tight">
        {detail.heroTitle ?? product.name}
      </h1>

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        <div
          className="flex min-w-0 items-center gap-1.5"
          aria-label={`Valoración ${displayRating} de 5, ${detail.reviews} opiniones`}
        >
          <div className="flex shrink-0 gap-0.5" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={cn(
                  'size-3.5 sm:size-4',
                  index < fullStars ? 'fill-red-600 text-red-600' : 'fill-neutral-200 text-neutral-200',
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground sm:text-sm">
            {displayRating.toFixed(1)} ({detail.reviews} opiniones)
          </span>
        </div>

        <span className="text-muted-foreground/50" aria-hidden="true">
          ·
        </span>

        <p className="text-xs text-muted-foreground sm:text-sm">
          SKU:{' '}
          <span className="font-medium text-[#0f1f3d]">{detail.sku}</span>
        </p>

        <span className="text-muted-foreground/50" aria-hidden="true">
          ·
        </span>

        <p
          className={cn(
            'text-xs font-medium sm:text-sm',
            outOfStock ? 'text-red-600' : 'text-emerald-700',
          )}
        >
          {outOfStock ? 'Sin stock' : `${stockDisplay} en stock`}
        </p>
      </div>

      {detail.heroLead ? (
        <p className="mt-2 text-sm font-semibold leading-snug text-[#0f1f3d] sm:text-base">
          {detail.heroLead}
        </p>
      ) : null}

      {detail.heroDescription ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {detail.heroDescription}
        </p>
      ) : null}

      {detail.heroSpecBullets.length > 0 ? (
        <ul
          className={cn(
            'mt-3 flex flex-col gap-1 text-sm leading-snug text-[#0f1f3d] sm:mt-4',
            detail.heroSpecBullets.some((bullet) => bullet.label && bullet.value) &&
              'list-disc pl-5 marker:text-[#0f1f3d]',
          )}
        >
          {detail.heroSpecBullets.map((bullet) => {
            const key = bullet.label ?? bullet.text ?? 'spec';
            if (bullet.label && bullet.value) {
              return (
                <li key={key}>
                  <span className="font-bold">{bullet.label}:</span> {bullet.value}
                </li>
              );
            }
            const IconComponent = bullet.icon;
            return (
              <li key={key} className="flex items-start gap-2">
                {IconComponent ? (
                  <IconComponent
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                ) : null}
                <span>{bullet.text}</span>
              </li>
            );
          })}
        </ul>
      ) : null}

      <div className="mt-3 min-w-0">
        <div
          ref={purchaseActionsRef}
          className="overflow-hidden rounded-lg border border-border/80 bg-white"
        >
          {detail.bulkDiscountTiers.length > 0 ? (
            <ProductBulkDiscountTable
              product={product}
              tiers={detail.bulkDiscountTiers}
              quantity={quantity}
              embedded
            />
          ) : null}

          <div className="flex flex-col p-4">
            {savingsMessage ? (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex rounded-sm bg-red-600 px-1.5 py-px text-[0.55rem] font-bold uppercase tracking-wide text-white sm:text-[0.6rem]">
                  Ahorro
                </span>
                <span className="text-[0.65rem] font-medium text-emerald-700 sm:text-xs">
                  {savingsMessage}
                </span>
              </div>
            ) : null}

            <div className="mt-2 grid grid-cols-2 items-end gap-3 sm:gap-4">
              <div className="min-w-0">
                {showStruckNormalPrice ? (
                  <p className="text-[0.65rem] font-medium text-muted-foreground line-through decoration-muted-foreground/80 sm:text-xs">
                    Precio Normal — {normalPriceLabel}
                  </p>
                ) : (
                  <p className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                    Precio Normal
                  </p>
                )}
                <p className="text-lg font-bold leading-tight text-red-600 sm:text-xl lg:text-[1.65rem]">
                  {formatPenFromUsdPrecise(volumePricing.unitUsd)}
                  <span className="ml-1 text-[0.65rem] font-semibold text-muted-foreground sm:text-xs">
                    / ud.
                  </span>
                </p>
                <p className="text-[0.65rem] text-muted-foreground sm:text-xs">
                  USD {formatUsd(volumePricing.unitUsd)}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                  Total
                </p>
                <p className="text-sm font-bold text-[#0f1f3d] sm:text-base">
                  <span className="text-red-600">
                    {formatPenFromUsdPrecise(volumePricing.totalUsd)}
                  </span>
                  <span className="ml-1 text-[0.65rem] font-medium text-muted-foreground sm:text-xs">
                    ({quantity} ud.)
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 min-[420px]:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] min-[420px]:items-start">
              <div
                className="flex h-11 items-stretch overflow-hidden rounded-md border border-border bg-muted/40"
                role="group"
                aria-label="Cantidad"
              >
                <button
                  type="button"
                  onClick={() => adjustQuantity(-1)}
                  disabled={quantity <= 1 || outOfStock}
                  aria-label="Disminuir cantidad"
                  className="flex size-11 items-center justify-center text-[#0f1f3d] hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-40"
                >
                  <Minus className="size-3.5" aria-hidden="true" />
                </button>
                <span
                  className="flex min-w-8 items-center justify-center text-xs font-semibold text-[#0f1f3d]"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => adjustQuantity(1)}
                  disabled={quantity >= maxQuantity || outOfStock}
                  aria-label="Aumentar cantidad"
                  className="flex size-11 items-center justify-center text-[#0f1f3d] hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-40"
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                </button>
              </div>

              <Button
                type="button"
                size="sm"
                disabled={outOfStock}
                onClick={handleBuyNow}
                className="h-11 min-h-11 w-full gap-1.5 rounded-md bg-red-600 px-3 text-xs font-bold uppercase text-white hover:bg-red-500 focus-visible:ring-red-600 sm:text-sm"
              >
                <ShoppingCart className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">Comprar ahora</span>
              </Button>

              <AddToCartButton
                product={product}
                addOptions={cartAddOptions}
                size="sm"
                variant="outline"
                disabled={outOfStock}
                className="h-11 min-h-11 w-full gap-1.5 rounded-md border-[#0f1f3d] bg-white px-3 text-xs font-bold uppercase text-[#0f1f3d] hover:bg-muted/30 focus-visible:ring-[#0f1f3d] sm:text-sm"
              >
                <ShoppingCart className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">Agregar a carrito</span>
              </AddToCartButton>
            </div>

            <div
              className={cn(
                'mt-2 grid grid-cols-1 gap-2',
                onQuoteClick ? 'sm:grid-cols-2' : '',
              )}
            >
              <ProductWhatsAppButton
                stopPropagation={false}
                accent="outline"
                label="Comprar vía WhatsApp"
                quantity={quantity}
                product={{
                  id: product.id,
                  name: product.name,
                  priceUsd: displayUsd,
                  category: product.category,
                  brand: product.brand ?? null,
                }}
                className="h-11 min-h-11 w-full rounded-md px-3 text-xs font-semibold normal-case tracking-normal sm:text-sm"
              />
              {onQuoteClick ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onQuoteClick}
                  className="h-11 min-h-11 w-full gap-1.5 rounded-md border-[#0f1f3d] px-3 text-xs font-semibold normal-case text-[#0f1f3d] hover:bg-muted/30 focus-visible:ring-[#0f1f3d] sm:text-sm"
                >
                  <ClipboardList className="size-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">Generar cotización</span>
                </Button>
              ) : null}
            </div>

            {comboSlot ? <div className="mt-4 min-w-0">{comboSlot}</div> : null}

            {detail.technicalSheetUrl ? (
              <TechnicalSheetDownloadLink href={detail.technicalSheetUrl} />
            ) : null}

            <p className="mt-2 flex items-center justify-center gap-1.5 text-[0.65rem] text-muted-foreground sm:text-xs">
              <Clock className="size-3.5 shrink-0" aria-hidden="true" />
              Respuesta en menos de 5 min
            </p>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-stretch border-t border-border/60 pt-3">
        <button
          type="button"
          onClick={handleWishlist}
          aria-pressed={wishlistSelected}
          className={cn(
            actionRowItemClassName,
            'hover:text-red-600',
            wishlistSelected && 'text-red-600',
          )}
        >
          <Heart
            className={cn(
              'size-3.5 shrink-0 text-muted-foreground sm:size-4',
              wishlistSelected && 'fill-current text-red-600',
            )}
            aria-hidden="true"
          />
          <span className="truncate">Favoritos</span>
        </button>

        <span className="w-px shrink-0 self-stretch bg-border" aria-hidden="true" />

        <button
          type="button"
          disabled={outOfStock}
          onClick={handleBuyNow}
          className={cn(
            actionRowItemClassName,
            'hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <ShoppingCart className="size-3.5 shrink-0 text-muted-foreground sm:size-4" aria-hidden="true" />
          <span className="truncate">Comprar</span>
        </button>
      </div>

      <div className="mt-2 flex items-stretch border-t border-border/60 pt-3">
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 px-1 text-center text-[0.65rem] font-medium text-[#0f1f3d] sm:text-xs">
          <Shield className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span>Compra segura</span>
        </div>
        <span className="w-px shrink-0 self-stretch bg-border" aria-hidden="true" />
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 px-1 text-center text-[0.65rem] font-medium text-[#0f1f3d] sm:text-xs">
          <Truck className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span>Envíos a todo el país</span>
        </div>
      </div>
    </div>
  );
}
