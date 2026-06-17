import { useMemo, useState } from 'react';
import {
  ClipboardList,
  FileText,
  GitCompareArrows,
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
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { useProductCompare } from '@/context/product-compare-context';
import { useWishlist } from '@/context/wishlist-context';
import { productToCompareItem } from '@/lib/compare-product';
import { ensureFullPrices } from '@/lib/roles';
import { resolveProductCardPricing } from '@/lib/product-card-pricing';
import { cn, formatPenFromUsdPrecise, formatUsd, penToUsd, usdToPen } from '@/lib/utils';
import { productToWishlistItem } from '@/lib/wishlist-product';
import type { ProductDetailViewModel } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductDetailHeroInfoProps {
  product: Product;
  detail: ProductDetailViewModel;
  onQuoteClick?: () => void;
}

const actionRowItemClassName =
  'inline-flex items-center gap-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 text-muted-foreground hover:text-[#0f1f3d]';

export function ProductDetailHeroInfo({
  product,
  detail,
  onQuoteClick,
}: ProductDetailHeroInfoProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const { isSelected: isCompareSelected, toggle: toggleCompare } = useProductCompare();
  const { isSelected: isWishlistSelected, toggle: toggleWishlist } = useWishlist();

  const displayUsd = product.prices
    ? ensureFullPrices(product.prices).public
    : product.price;
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
  const savingsPercent =
    detail.discountPercent ??
    (hasSavings && previousPen ? Math.round((savingsPen / previousPen) * 100) : 0);
  const outOfStock = isProductOutOfStock(product);
  const stockDisplay = outOfStock ? 0 : product.stock;
  const maxQuantity = outOfStock ? 1 : Math.max(1, stockDisplay || 99);

  const adjustQuantity = (delta: number) => {
    setQuantity((current) => Math.max(1, Math.min(maxQuantity, current + delta)));
  };

  const handleBuyNow = () => {
    if (outOfStock) return;
    addItem(product, { quantity, openDrawer: true });
  };

  const compareSelected = isCompareSelected(product.id);
  const wishlistSelected = isWishlistSelected(product.id);

  const handleCompare = () => {
    toggleCompare(productToCompareItem(product));
  };

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

      <div className="mt-3 rounded-lg bg-white p-3 sm:p-3.5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {savingsPercent > 0 ? (
              <span className="inline-flex rounded-sm bg-red-600 px-1.5 py-px text-[0.6rem] font-bold uppercase tracking-wide text-white">
                −{savingsPercent}% hoy
              </span>
            ) : (
              <span className="inline-flex rounded-sm border border-red-600/30 bg-red-50 px-1.5 py-px text-[0.6rem] font-bold uppercase tracking-wide text-red-600">
                Mejor precio
              </span>
            )}
            <span
              className="inline-flex rounded-sm border border-border/80 bg-muted/30 px-1.5 py-px text-[0.6rem] font-medium text-muted-foreground"
              title="El precio mostrado incluye IGV"
            >
              Incl. IGV
            </span>
          </div>

          {hasSavings ? (
            <p className="mt-1.5 text-xs text-muted-foreground line-through decoration-muted-foreground/80">
              S/{' '}
              {previousPen!.toLocaleString('es-PE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          ) : null}

          <p className="mt-0.5 text-2xl font-bold leading-tight text-red-600 sm:text-[1.65rem]">
            {formatPenFromUsdPrecise(displayUsd)}
          </p>

          {hasSavings ? (
            <p className="mt-1 text-sm font-semibold text-red-600">
              Ahorras S/{' '}
              {savingsPen.toLocaleString('es-PE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              {savingsPercent > 0 ? ` (−${savingsPercent}%)` : ''}
            </p>
          ) : null}

          <p className="mt-1 text-xs text-muted-foreground">USD {formatUsd(displayUsd)}</p>
        </div>

        <div className="mt-3 flex flex-row flex-wrap items-end gap-2">
          <div className="shrink-0">
            <p className="mb-1 text-[0.65rem] text-muted-foreground">Cantidad</p>
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
                className="flex min-w-9 items-center justify-center text-xs font-bold text-[#0f1f3d]"
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
          </div>

          <Button
            type="button"
            size="sm"
            disabled={outOfStock}
            onClick={handleBuyNow}
            className="h-11 min-h-11 min-w-0 flex-1 gap-1.5 rounded-md bg-red-600 px-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-red-500 focus-visible:ring-red-600 sm:flex-[1.2]"
          >
            <ShoppingCart className="size-3.5 shrink-0" aria-hidden="true" />
            Comprar ahora
          </Button>

          <AddToCartButton
            product={product}
            addOptions={{ quantity }}
            size="sm"
            variant="outline"
            disabled={outOfStock}
            className="h-11 min-h-11 min-w-0 flex-1 gap-1.5 rounded-md border-border bg-white px-2 text-xs font-bold uppercase tracking-wide text-[#0f1f3d] hover:bg-muted/30 focus-visible:ring-[#0f1f3d] sm:flex-[1.2]"
          >
            <ShoppingCart className="size-3.5 shrink-0" aria-hidden="true" />
            Añadir al carrito
          </AddToCartButton>
        </div>

        <div className="mt-2.5">
          <ProductWhatsAppButton
            stopPropagation={false}
            accent="outline"
            label="Consultar vía WhatsApp"
            quantity={quantity}
            product={{
              id: product.id,
              name: product.name,
              priceUsd: displayUsd,
              category: product.category,
              brand: product.brand ?? null,
            }}
            className="h-9 min-h-9 w-full rounded-md border border-[#25D366]/70 bg-transparent px-3 text-[0.7rem] font-medium normal-case tracking-normal text-[#25D366] hover:bg-[#25D366]/5"
          />
          <p className="mt-1 text-center text-[0.65rem] text-muted-foreground">
            Respuesta en menos de 5 min
          </p>
        </div>

        <div className="mt-3 flex items-stretch border-t border-border/60 pt-3">
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

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm">
        <button
          type="button"
          onClick={handleCompare}
          aria-pressed={compareSelected}
          className={cn(
            actionRowItemClassName,
            compareSelected && 'text-red-600 hover:text-red-600',
          )}
        >
          <GitCompareArrows className="size-4 shrink-0" aria-hidden="true" />
          Comparar
        </button>

        <span className="h-4 w-px bg-border" aria-hidden="true" />

        <button
          type="button"
          onClick={handleWishlist}
          aria-pressed={wishlistSelected}
          className={cn(
            actionRowItemClassName,
            wishlistSelected && 'text-red-600 hover:text-red-600',
          )}
        >
          <Heart
            className={cn('size-4 shrink-0', wishlistSelected && 'fill-current')}
            aria-hidden="true"
          />
          Agregar a favoritos
        </button>

        {detail.technicalSheetUrl ? (
          <>
            <span className="h-4 w-px bg-border" aria-hidden="true" />

            <a
              href={detail.technicalSheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={actionRowItemClassName}
            >
              <FileText className="size-4 shrink-0" aria-hidden="true" />
              Ficha Técnica
            </a>
          </>
        ) : null}

        {onQuoteClick ? (
          <>
            <span className="h-4 w-px bg-border" aria-hidden="true" />

            <button type="button" onClick={onQuoteClick} className={actionRowItemClassName}>
              <ClipboardList className="size-4 shrink-0" aria-hidden="true" />
              Generar Cotización
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
