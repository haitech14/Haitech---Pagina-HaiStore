import { useState } from 'react';
import {
  Copy,
  Droplets,
  Gauge,
  Heart,
  Printer,
  ScanLine,
  ShoppingCart,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { ProductCardCopyButton } from '@/components/product/product-card-copy-button';
import { ProductQuantityAddFooter } from '@/components/product/product-quantity-add-footer';
import { ProductRating } from '@/components/product/product-rating';
import { ProductStockHover } from '@/components/product/product-stock-hover';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/cart-context';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { useWishlist } from '@/context/wishlist-context';
import {
  formatHaitechPen,
  HAITECH_SHOP,
  HAITECH_SHOP_EQUIPMENT_FEATURES,
  resolveHaitechShopStockLocations,
  type HaitechShopFeatureId,
  type HaitechShopProduct,
} from '@/data/haitech-home-shop';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { getDisplayPriceVisibility } from '@/lib/display-price';
import { roundEquipmentDisplayUsd } from '@/lib/pen-pricing';
import { penToUsd, cn } from '@/lib/utils';
import type { WishlistItem } from '@/lib/wishlist-product';
import type { Product } from '@/types/product';

const overlayButtonClass =
  'flex size-8 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]';

function EquipmentFeatureIcon({
  featureId,
  className,
}: {
  featureId: HaitechShopFeatureId;
  className?: string;
}) {
  const props = { className, strokeWidth: 1.6 as const, 'aria-hidden': true as const };
  switch (featureId) {
    case 'copia':
      return <Copy {...props} />;
    case 'escanea':
      return <ScanLine {...props} />;
    case 'imprime':
      return <Printer {...props} />;
    case 'rendimiento':
      return <Gauge {...props} />;
    default:
      return <Copy {...props} />;
  }
}

function resolveEquipmentFeatureValue(
  featureId: HaitechShopFeatureId,
  equipment: HaitechShopProduct['equipment'],
): string | null {
  if (!equipment) return null;
  if (featureId === 'escanea') return equipment.scannerType ?? null;
  if (featureId === 'imprime') return equipment.speedPpm ?? null;
  if (featureId === 'rendimiento') return equipment.monthlyYield ?? null;
  return null;
}

function toCartProduct(product: HaitechShopProduct, saleRate?: number): Product {
  const priceUsd = Math.round(penToUsd(product.price, saleRate) * 100) / 100;
  return {
    id: product.id,
    name: product.name,
    description: product.name,
    price: priceUsd,
    currency: 'USD',
    image_url: product.image,
    stock: Math.max(0, Math.floor(Number(product.stock) || 0)),
    category: 'Equipos',
    brand: product.brand ?? 'RICOH',
    ...(product.code ? { code: product.code } : {}),
    created_at: new Date().toISOString(),
  };
}

function formatHaitechUsd(usd: number): string {
  const normalized = Math.round(usd * 100) / 100;
  const isWhole = Math.abs(normalized % 1) < 0.001;
  return `US$ ${normalized.toLocaleString('en-US', {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: isWhole ? 0 : 2,
  })}`;
}

function stripBrandFromProductName(name: string): string {
  return name.replace(/\bRICOH\b/gi, '').replace(/\s+/g, ' ').trim();
}

function formatHaitechProductDisplayTitle(product: HaitechShopProduct): string {
  const baseName = stripBrandFromProductName(product.name)
    .replace(/\b(nuevo|seminuevo)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return baseName;
}

function haitechShopProductToWishlistItem(
  product: HaitechShopProduct,
  displayTitle: string,
  saleRate?: number,
): WishlistItem {
  return {
    id: product.id,
    name: displayTitle,
    category: product.toner ? 'Consumibles' : 'Equipos',
    brand: product.brand ?? null,
    price: penToUsd(product.price, saleRate),
    image: product.image,
  };
}

function resolveClipboardCondition(product: HaitechShopProduct): string | undefined {
  if (product.condition === 'nuevo') return 'Nuevo';
  if (product.condition === 'seminuevo') return 'Seminuevo';
  return undefined;
}

/** Card de producto — layout mockup HAITECH (badge, features, precio rojo, WhatsApp). */
export function HaitechHomeProductCard({
  product,
  className,
  variant = 'default',
}: {
  product: HaitechShopProduct;
  className?: string;
  /** Destacados del home: subtítulo, valoración y título completo. */
  variant?: 'default' | 'featured';
}) {
  const { addItem } = useCart();
  const { isSelected: isWishlisted, toggle: toggleWishlist } = useWishlist();
  const { data: companySettings } = useCompanySettings();
  const saleRate = companySettings?.usdToPenExchangeRate;
  const [imgError, setImgError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const isConsumableProduct = Boolean(product.toner);
  const rawPriceUsd = penToUsd(product.price, saleRate);
  const priceUsd = isConsumableProduct
    ? rawPriceUsd
    : roundEquipmentDisplayUsd(rawPriceUsd);
  const displayTitle = formatHaitechProductDisplayTitle(product);
  const featuredTitle = product.featuredTitle ?? displayTitle;
  const isFeaturedVariant = variant === 'featured';
  const features = product.features?.length
    ? HAITECH_SHOP_EQUIPMENT_FEATURES.filter((f) => product.features?.includes(f.id))
    : [];
  const stockCount = Math.max(0, Math.floor(Number(product.stock) || 0));
  const hasStock = product.stock != null;
  const outOfStock = hasStock && stockCount <= 0;
  const buyNowLabel = outOfStock ? 'Reservar' : 'Comprar';
  const cartProduct = toCartProduct(product, saleRate);
  const mediaBlock = (
    <div className="relative">
      <CardMedia product={product} imgError={imgError} onImgError={() => setImgError(true)} />
      <CardImageOverlayActions
        product={product}
        displayTitle={displayTitle}
        priceUsd={priceUsd}
        isWishlisted={isWishlisted(product.id)}
        onWishlist={() =>
          toggleWishlist(haitechShopProductToWishlistItem(product, displayTitle, saleRate))
        }
        onBuy={() => addItem(toCartProduct(product, saleRate), { openDrawer: true })}
      />
    </div>
  );

  return (
    <article
      className={cn(
        'group group/card relative flex w-full flex-col overflow-hidden rounded-xl border bg-white p-2.5',
        'shadow-[0_4px_18px_rgba(15,31,61,0.07)] transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(15,31,61,0.1)]',
        'sm:p-4',
        className,
      )}
      style={{ borderColor: HAITECH_SHOP.cardBorder }}
    >
      {product.href ? (
        <Link
          to={product.href}
          className="flex flex-col outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/30"
        >
          {mediaBlock}
          <CardInfo
            product={product}
            priceUsd={priceUsd}
            displayTitle={isFeaturedVariant ? featuredTitle : displayTitle}
            variant={variant}
            {...(saleRate != null ? { saleRate } : {})}
          />
        </Link>
      ) : (
        <div className="flex flex-col">
          {mediaBlock}
          <CardInfo
            product={product}
            priceUsd={priceUsd}
            displayTitle={isFeaturedVariant ? featuredTitle : displayTitle}
            variant={variant}
            {...(saleRate != null ? { saleRate } : {})}
          />
        </div>
      )}

      <div className="mt-2 flex justify-center sm:mt-3">
        <ProductQuantityAddFooter
          product={cartProduct}
          size="sm"
          addLabel={buyNowLabel}
          revealQuantityOnHover
          onQuantityChange={setQuantity}
          quantityClassName="h-9 rounded-lg sm:h-10"
          addButtonClassName={cn(
            'h-9 min-h-9 max-h-9 flex-none rounded-lg px-4 text-[10px] font-bold shadow-none sm:h-10 sm:min-h-10 sm:max-h-10 sm:px-5 sm:text-[13px]',
            outOfStock
              ? 'bg-[#111111] hover:bg-[#222222]'
              : 'border-[#E30613] bg-[#E30613] hover:border-[#c90511] hover:bg-[#c90511]',
          )}
          centeredActions
          belowAlways
          belowOnHover={
            <ProductWhatsAppButton
              stopPropagation
              skipDialogIfComplete
              accent="outline"
              compact
              label="Comprar por WhatsApp"
              quantity={quantity}
              product={{
                id: cartProduct.id,
                name: isFeaturedVariant ? featuredTitle : displayTitle,
                priceUsd,
                category: cartProduct.category,
                brand: cartProduct.brand ?? null,
                ...(product.code ? { code: product.code } : {}),
              }}
              className="w-full rounded-lg"
            />
          }
        />
      </div>

      <CardProductSpecs product={product} features={features} />
    </article>
  );
}

function CardImageOverlayActions({
  product,
  displayTitle,
  priceUsd,
  isWishlisted,
  onWishlist,
  onBuy,
}: {
  product: HaitechShopProduct;
  displayTitle: string;
  priceUsd: number;
  isWishlisted: boolean;
  onWishlist: () => void;
  onBuy: () => void;
}) {
  const clipboardCondition = resolveClipboardCondition(product);
  const stockCount = Math.max(0, Math.floor(Number(product.stock) || 0));
  const clipboardBasicFeatures = [
    product.equipment?.speedPpm,
    product.equipment?.paperSize,
    product.equipment?.scannerType,
    product.equipment?.monthlyYield,
    product.toner
      ? [
          product.toner.original ? 'Original' : 'Compatible',
          product.toner.yieldLabel,
          product.toner.colorLabel,
        ]
          .filter(Boolean)
          .join(' · ')
      : null,
  ]
    .flatMap((value) => (value ? [value] : []))
    .join(' · ');

  return (
    <div
      className={cn(
        'pointer-events-auto absolute right-0 top-0 z-10 flex flex-col gap-1.5',
        'opacity-0 transition-opacity duration-200 ease-out motion-reduce:opacity-100',
        'group-hover/card:opacity-100 group-focus-within/card:opacity-100 max-md:opacity-100',
      )}
    >
      <button
        type="button"
        aria-pressed={isWishlisted}
        aria-label={
          isWishlisted
            ? `Quitar ${displayTitle} de favoritos`
            : `Añadir ${displayTitle} a favoritos`
        }
        className={cn(
          overlayButtonClass,
          isWishlisted
            ? 'border-[#E30613] bg-[#FFF0F1] text-[#E30613]'
            : 'text-[#E30613] hover:bg-[#FFF0F1]',
        )}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onWishlist();
        }}
      >
        <Heart
          className={cn('size-4', isWishlisted && 'fill-[#E30613]')}
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>
      <button
        type="button"
        aria-label={`Añadir ${displayTitle} al carrito`}
        className={cn(overlayButtonClass, 'text-[#E30613] hover:bg-[#FFF0F1]')}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onBuy();
        }}
      >
        <ShoppingCart className="size-4" strokeWidth={2} aria-hidden="true" />
      </button>
      <ProductCardCopyButton
        productName={displayTitle}
        title={displayTitle}
        stock={stockCount}
        priceUsd={priceUsd}
        productId={product.id}
        category={product.toner ? 'Consumibles' : 'Equipos'}
        {...(clipboardCondition ? { condition: clipboardCondition } : {})}
        {...(product.code ? { code: product.code } : {})}
        {...(clipboardBasicFeatures
          ? { basicFeatures: clipboardBasicFeatures }
          : {})}
        {...(product.href ? { productPath: product.href } : {})}
        className={cn(overlayButtonClass, 'text-neutral-700 hover:bg-neutral-50')}
      />
    </div>
  );
}

function CardBrand({ brand }: { brand?: string }) {
  if (!brand) return null;

  return (
    <span
      className="min-w-0 truncate font-[family-name:var(--font-infobox)] text-[12px] font-black uppercase leading-none tracking-[0.02em] text-[#E30613] sm:text-[13px]"
      style={{ WebkitTextStroke: '0.35px currentColor' }}
    >
      {brand}
    </span>
  );
}

/** Badge NUEVO / SEMINUEVO — píldora negra del mockup. */
function ConditionPillBadge({
  condition,
}: {
  condition?: HaitechShopProduct['condition'];
}) {
  if (condition !== 'nuevo' && condition !== 'seminuevo') return null;
  const isNuevo = condition === 'nuevo';

  return (
    <span
      className={cn(
        'inline-flex h-[18px] w-fit shrink-0 items-center justify-center rounded-full px-2.5',
        'text-[9px] font-bold uppercase leading-none tracking-[0.08em]',
        isNuevo
          ? 'bg-[#111111] text-white'
          : 'border border-[#555] bg-white text-[#555]',
      )}
    >
      {isNuevo ? 'NUEVO' : 'SEMINUEVO'}
    </span>
  );
}

function isOriginalConsumable(product: HaitechShopProduct): boolean {
  if (product.toner?.original === true) return true;
  if (product.toner?.original === false) return false;
  return /\boriginal\b/i.test(product.name);
}

function CardProductBadges({ product }: { product: HaitechShopProduct }) {
  const showOriginal = isOriginalConsumable(product);
  if (!showOriginal) return null;

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex h-[18px] w-fit items-center justify-center rounded-full px-2.5 py-0 shadow-none',
        'border-transparent bg-[#0f1f3d] text-white hover:bg-[#0f1f3d]',
        'text-[9px] font-bold uppercase leading-none tracking-[0.08em]',
      )}
    >
      Original
    </Badge>
  );
}

function CardMedia({
  product,
  imgError,
  onImgError,
}: {
  product: HaitechShopProduct;
  imgError: boolean;
  onImgError: () => void;
}) {
  return (
    <div className="relative flex h-[120px] w-full shrink-0 items-center justify-center overflow-hidden sm:h-[184px]">
      {!imgError ? (
        <img
          src={product.image}
          alt=""
          width={220}
          height={168}
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover/card:scale-105"
          loading="lazy"
          decoding="async"
          onError={onImgError}
        />
      ) : (
        <div
          className="flex size-full items-center justify-center rounded-lg bg-[#F0F0F0] text-sm font-bold text-[#999]"
          aria-hidden="true"
        >
          {product.name.slice(0, 1)}
        </div>
      )}
    </div>
  );
}

function CardPriceBlock({
  product,
  priceUsd,
  saleRate,
}: {
  product: HaitechShopProduct;
  priceUsd: number;
  saleRate?: number;
}) {
  const { displayCurrency, dualPriceOrder } = useDisplayCurrency();
  const { showUsd, showPen } = getDisplayPriceVisibility(displayCurrency);
  const isConsumableProduct = Boolean(product.toner);
  const penFirst = dualPriceOrder === 'pen-usd';
  const compareUsd =
    product.compareAt != null
      ? isConsumableProduct
        ? penToUsd(product.compareAt, saleRate)
        : roundEquipmentDisplayUsd(penToUsd(product.compareAt, saleRate))
      : null;

  const compareLabel =
    product.compareAt == null
      ? null
      : showPen && !showUsd
        ? formatHaitechPen(product.compareAt)
        : showUsd && !showPen && compareUsd != null
          ? formatHaitechUsd(compareUsd)
          : formatHaitechPen(product.compareAt);

  const penPrimary = (
    <p
      className={cn(
        'font-price text-[17px] font-semibold leading-none tracking-tight tabular-nums text-[#111] sm:text-[18px]',
        (product.compareAt != null || product.discountLabel) && 'mt-1.5',
      )}
    >
      {formatHaitechPen(product.price)}
    </p>
  );
  const usdPrimary = (
    <p
      className={cn(
        'font-price text-[17px] font-semibold leading-none tracking-tight tabular-nums text-[#E30613] sm:text-[18px]',
        (product.compareAt != null || product.discountLabel) && 'mt-1.5',
      )}
    >
      {formatHaitechUsd(priceUsd)}
    </p>
  );
  const penSecondary = (
    <p className="mt-1 font-price text-[12px] font-semibold tabular-nums text-[#6B7280]">
      {formatHaitechPen(product.price)}
    </p>
  );
  const usdSecondary = (
    <p className="mt-1 font-price text-[12px] font-semibold tabular-nums text-[#6B7280]">
      {formatHaitechUsd(priceUsd)}
    </p>
  );

  return (
    <>
      {product.compareAt != null || product.discountLabel ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {compareLabel ? (
            <span className="font-price text-[10px] tabular-nums tracking-wide text-[#A0A0A0] line-through sm:text-[11px]">
              {compareLabel}
            </span>
          ) : null}
          {product.discountLabel ? (
            <span
              className="inline-flex rounded-full px-1.5 py-0.5 text-[8px] font-semibold tracking-wide text-white sm:text-[9px]"
              style={{ backgroundColor: HAITECH_SHOP.brand }}
            >
              {product.discountLabel}
            </span>
          ) : null}
        </div>
      ) : null}

      {displayCurrency === 'PEN' && penPrimary}
      {displayCurrency === 'USD' && priceUsd > 0 && usdPrimary}
      {displayCurrency === 'BOTH' && priceUsd > 0 && (
        <>
          {penFirst ? (
            <>
              {penPrimary}
              {usdSecondary}
            </>
          ) : (
            <>
              {usdPrimary}
              {penSecondary}
            </>
          )}
        </>
      )}
      {displayCurrency === 'BOTH' && priceUsd <= 0 && penPrimary}
    </>
  );
}

function CardInfo({
  product,
  priceUsd,
  saleRate,
  displayTitle,
  variant = 'default',
}: {
  product: HaitechShopProduct;
  priceUsd: number;
  saleRate?: number;
  displayTitle: string;
  variant?: 'default' | 'featured';
}) {
  const isFeaturedVariant = variant === 'featured';
  const codeLabel = product.code?.trim() || null;
  const hasStock = product.stock != null;
  const stockCount = Math.max(0, Math.floor(Number(product.stock) || 0));
  const outOfStock = hasStock && stockCount <= 0;
  const rating = product.rating ?? 5;
  const reviewCount = product.reviewCount ?? 0;

  return (
    <div className="mt-2 flex flex-col">
      <div className="mb-1.5 flex min-w-0 items-center justify-between gap-2">
        <CardBrand brand={product.brand ?? 'RICOH'} />
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
          <ConditionPillBadge condition={product.condition} />
          <CardProductBadges product={product} />
        </div>
      </div>

      {isFeaturedVariant && product.productTypeLabel ? (
        <p className="text-[11px] font-medium leading-snug text-[#444444] sm:text-[12px]">
          {product.productTypeLabel}
        </p>
      ) : null}

      <h3
        className={cn(
          'text-pretty break-words leading-snug text-[#111]',
          isFeaturedVariant
            ? 'text-[13px] font-bold sm:text-[14px]'
            : 'text-[13px] font-bold sm:text-[14px]',
        )}
        title={displayTitle}
      >
        {displayTitle}
      </h3>

      {isFeaturedVariant && reviewCount > 0 ? (
        <div className="mt-1.5">
          <ProductRating rating={rating} reviews={reviewCount} className="[&_span]:text-[11px] [&_span]:text-[#9CA3AF]" />
        </div>
      ) : null}

      {codeLabel || hasStock ? (
        <div
          className={cn(
            'grid grid-rows-[0fr] overflow-hidden opacity-0 transition-[grid-template-rows,margin,opacity] duration-200 ease-out',
            'group-hover/card:mt-1.5 group-hover/card:grid-rows-[1fr] group-hover/card:opacity-100',
            'group-focus-within/card:mt-1.5 group-focus-within/card:grid-rows-[1fr] group-focus-within/card:opacity-100',
            'motion-reduce:mt-1.5 motion-reduce:grid-rows-[1fr] motion-reduce:opacity-100',
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className="flex min-w-0 items-center gap-1.5 text-[10px] font-medium leading-none text-[#8a93a3] sm:text-[11px]"
              aria-label={[
                codeLabel ? `Código ${codeLabel}` : null,
                hasStock ? (outOfStock ? 'Sin stock' : `Stock ${stockCount}`) : null,
              ]
                .filter(Boolean)
                .join(', ')}
            >
              {codeLabel ? (
                <span className="min-w-0 truncate tabular-nums" title={codeLabel}>
                  {codeLabel}
                </span>
              ) : (
                <span className="min-w-0" aria-hidden="true" />
              )}
              {hasStock ? (
                <ProductStockHover
                  stock={stockCount}
                  outOfStock={outOfStock}
                  stockLocations={resolveHaitechShopStockLocations(product)}
                  prefix="Stock "
                  emptyLabel="Sin stock"
                  className="ml-auto text-[10px] font-medium sm:text-[11px]"
                  iconClassName="size-3 shrink-0"
                />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className={cn(isFeaturedVariant ? 'mt-3' : 'mt-4')}>
        <CardPriceBlock
          product={product}
          priceUsd={priceUsd}
          {...(saleRate != null ? { saleRate } : {})}
        />
      </div>
    </div>
  );
}

function CardProductSpecs({
  product,
  features,
}: {
  product: HaitechShopProduct;
  features: typeof HAITECH_SHOP_EQUIPMENT_FEATURES;
}) {
  const specsContent =
    features.length > 0 ? (
      <ul className="grid grid-cols-4 gap-1" aria-label="Funciones del equipo">
        {features.map((feature) => {
          const value = resolveEquipmentFeatureValue(feature.id, product.equipment);
          return (
            <li key={feature.id} className="flex flex-col items-center gap-0.5 text-center">
              <EquipmentFeatureIcon
                featureId={feature.id}
                className="size-4 text-[#9A9A9A] sm:size-[18px]"
              />
              {value ? (
                <span className="text-[9px] font-semibold leading-tight text-[#555] sm:text-[10px]">
                  {value}
                </span>
              ) : null}
              <span className="text-[8px] font-medium tracking-wide text-[#9A9A9A] sm:text-[9px]">
                {feature.label}
              </span>
            </li>
          );
        })}
      </ul>
    ) : product.toner ? (
      <ul
        className="grid grid-cols-3 gap-1.5 rounded-lg bg-[#F7F7F7] px-2 py-2"
        aria-label="Especificaciones de tóner"
      >
        <li className="flex flex-col items-center gap-0.5 text-center">
          <Gauge className="size-4 text-[#9A9A9A] sm:size-[18px]" strokeWidth={1.6} aria-hidden="true" />
          <span className="text-[9px] font-medium leading-tight text-[#555] sm:text-[10px]">
            {product.toner.yieldLabel}
          </span>
          <span className="text-[8px] uppercase tracking-wide text-[#9A9A9A]">Rendimiento</span>
        </li>
        <li className="flex flex-col items-center gap-0.5 text-center">
          <span className="relative flex size-4 items-center justify-center sm:size-[18px]">
            <Droplets className="size-full text-[#9A9A9A]" strokeWidth={1.6} aria-hidden="true" />
            {product.colorSwatch ? (
              <span
                className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-white"
                style={{ backgroundColor: product.colorSwatch }}
                aria-hidden="true"
              />
            ) : null}
          </span>
          <span className="text-[9px] font-medium leading-tight text-[#555] sm:text-[10px]">
            {product.toner.colorLabel}
          </span>
          <span className="text-[8px] uppercase tracking-wide text-[#9A9A9A]">Color</span>
        </li>
        <li className="hidden sm:block" aria-hidden="true" />
      </ul>
    ) : null;

  if (!specsContent) return null;

  return (
    <div
      className={cn(
        'grid grid-rows-[0fr] overflow-hidden opacity-0 transition-[grid-template-rows,margin,opacity] duration-200 ease-out',
        'group-hover/card:mt-3 group-hover/card:grid-rows-[1fr] group-hover/card:opacity-100',
        'group-focus-within/card:mt-3 group-focus-within/card:grid-rows-[1fr] group-focus-within/card:opacity-100',
      )}
    >
      <div className="min-h-0 overflow-hidden">{specsContent}</div>
    </div>
  );
}
