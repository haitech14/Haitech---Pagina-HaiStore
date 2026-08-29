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
import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { Link } from 'react-router-dom';

import { ProductCardCopyButton } from '@/components/product/product-card-copy-button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/cart-context';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { useWishlist } from '@/context/wishlist-context';
import {
  formatHaitechPen,
  HAITECH_SHOP,
  HAITECH_SHOP_EQUIPMENT_FEATURES,
  type HaitechShopFeatureId,
  type HaitechShopProduct,
} from '@/data/haitech-home-shop';
import { useHaitechWhatsAppQuoteContext } from '@/hooks/use-haitech-whatsapp-quote';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { getDisplayPriceVisibility } from '@/lib/display-price';
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
    stock: 1,
    category: 'Equipos',
    brand: product.brand ?? 'RICOH',
    created_at: new Date().toISOString(),
  };
}

function formatHaitechUsd(usd: number): string {
  return `US$ ${usd.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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

function isTopVentasBadge(badge?: string): boolean {
  return Boolean(badge && /m[aá]s\s*vendido/i.test(badge));
}

function buildProductQuoteExtraLines(product: HaitechShopProduct, priceUsd: number): string[] {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://haitech.pe';
  const productUrl = product.href ? `${origin}${product.href}` : origin;
  const lines = [
    'Quiero *comprar* este producto:',
    '',
    `*${formatHaitechProductDisplayTitle(product)}*`,
    `Precio: *${formatHaitechPen(product.price)}* · *${formatHaitechUsd(priceUsd)}*`,
  ];

  if (product.discountLabel) {
    lines.push(`Descuento: ${product.discountLabel}`);
  }

  if (product.toner) {
    lines.push(
      `Tipo: *${product.toner.original ? 'Original' : 'Compatible'}*`,
      `Rendimiento: *${product.toner.yieldLabel}*`,
      `Color: *${product.toner.colorLabel}*`,
    );
  }

  lines.push('', `Link: ${productUrl}`);
  return lines;
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
}: {
  product: HaitechShopProduct;
  className?: string;
}) {
  const { addItem } = useCart();
  const { isSelected: isWishlisted, toggle: toggleWishlist } = useWishlist();
  const { requestQuote } = useHaitechWhatsAppQuoteContext();
  const { data: companySettings } = useCompanySettings();
  const saleRate = companySettings?.usdToPenExchangeRate;
  const [imgError, setImgError] = useState(false);
  const priceUsd = penToUsd(product.price, saleRate);
  const displayTitle = formatHaitechProductDisplayTitle(product);
  const features = product.features?.length
    ? HAITECH_SHOP_EQUIPMENT_FEATURES.filter((f) => product.features?.includes(f.id))
    : [];
  const brandLabel = <CardBrand brand={product.brand ?? 'RICOH'} />;
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
        'group/card relative flex w-full flex-col overflow-hidden rounded-xl border bg-white p-3.5',
        'shadow-[0_4px_18px_rgba(15,31,61,0.07)] transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(15,31,61,0.1)]',
        'sm:p-4',
        className,
      )}
      style={{ borderColor: HAITECH_SHOP.cardBorder }}
    >
      {isTopVentasBadge(product.badge) ? <TopVentasCornerRibbon /> : null}

      {product.href ? (
        <Link
          to={product.href}
          className="flex flex-col outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/30"
        >
          {brandLabel}
          {mediaBlock}
          <CardInfo product={product} priceUsd={priceUsd} saleRate={saleRate} />
        </Link>
      ) : (
        <div className="flex flex-col">
          {brandLabel}
          {mediaBlock}
          <CardInfo product={product} priceUsd={priceUsd} saleRate={saleRate} />
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => addItem(toCartProduct(product, saleRate), { openDrawer: true })}
          className={cn(
            'inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border px-3',
            'border-[#E30613] bg-[#E30613] text-[12px] font-bold text-white sm:text-[13px]',
            'transition-colors hover:border-[#c90511] hover:bg-[#c90511]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/40 focus-visible:ring-offset-2',
          )}
        >
          <ShoppingCart className="size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
          <span className="truncate">Añadir al carrito</span>
        </button>
        <button
          type="button"
          onClick={() =>
            requestQuote({
              campaign: 'product-card',
              extraLines: buildProductQuoteExtraLines(product, priceUsd),
              requireDialog: true,
              title: 'Comprar por WhatsApp',
              description:
                'Completa tus datos para enviar el mensaje con el producto y el precio a nuestro equipo de ventas.',
              submitLabel: 'Enviar por WhatsApp',
            })
          }
          aria-label="Comprar por WhatsApp"
          className={cn(
            'group/wa inline-flex h-10 max-w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border px-0',
            'border-transparent bg-white text-[#25D366]',
            'transition-[max-width,padding,border-color,background-color] duration-300 ease-out',
            'hover:max-w-[11.5rem] hover:border-[#25D366]/40 hover:bg-[#25D366]/5 hover:px-3',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/40 focus-visible:border-[#25D366]/40',
          )}
        >
          <Icon path={mdiWhatsapp} size={0.95} className="shrink-0" aria-hidden="true" />
          <span
            className={cn(
              'ml-0 max-w-0 overflow-hidden whitespace-nowrap text-[11px] font-semibold text-[#25D366] opacity-0',
              'transition-[max-width,margin,opacity] duration-300 ease-out',
              'group-hover/wa:ml-2 group-hover/wa:max-w-[9rem] group-hover/wa:opacity-100',
              'group-focus-visible/wa:ml-2 group-focus-visible/wa:max-w-[9rem] group-focus-visible/wa:opacity-100',
            )}
          >
            Comprar por WhatsApp
          </span>
        </button>
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
        stock={1}
        priceUsd={priceUsd}
        productId={product.id}
        category={product.toner ? 'Consumibles' : 'Equipos'}
        {...(clipboardCondition ? { condition: clipboardCondition } : {})}
        {...(product.href ? { productPath: product.href } : {})}
        className={cn(overlayButtonClass, 'text-neutral-700 hover:bg-neutral-50')}
      />
    </div>
  );
}

function CardBrand({ brand }: { brand?: string }) {
  if (!brand) return null;

  return (
    <div className="mb-2 min-h-[18px]">
      <span
        className="font-[family-name:var(--font-infobox)] text-[12px] font-black uppercase leading-none tracking-[0.02em] text-[#E30613] sm:text-[13px]"
        style={{ WebkitTextStroke: '0.35px currentColor' }}
      >
        {brand}
      </span>
    </div>
  );
}

function TopVentasCornerRibbon() {
  return (
    <span
      className="pointer-events-none absolute right-0 top-0 z-20 size-[52px] sm:size-[58px]"
      aria-label="Top Ventas"
    >
      <svg
        viewBox="0 0 58 58"
        className="size-full drop-shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
        aria-hidden="true"
      >
        {/* Triángulo de esquina con vértice en ángulo recto (sin redondeo). */}
        <path
          d="M0 0 H58 V58 Z"
          className="fill-[#FFCC00]"
        />
      </svg>
      <span className="absolute right-[7px] top-[6px] flex flex-col items-center leading-none text-[#111] sm:right-[8px] sm:top-[7px]">
        <span className="text-[7px] font-black uppercase tracking-[0.04em] sm:text-[8px]">TOP</span>
        <span className="mt-0.5 text-[8px] font-bold sm:text-[9px]">Ventas</span>
      </span>
    </span>
  );
}

function CardConditionBadge({ condition }: { condition?: HaitechShopProduct['condition'] }) {
  if (condition !== 'nuevo' && condition !== 'seminuevo') return null;

  const isNuevo = condition === 'nuevo';

  return (
    <Badge
      variant="outline"
      className={cn(
        'mb-1.5 inline-flex h-[15px] w-fit items-center justify-center self-start rounded px-1.5 py-0 shadow-none',
        'text-[7px] font-bold uppercase leading-none tracking-[0.06em] sm:h-4 sm:px-[7px] sm:text-[8px]',
        isNuevo
          ? 'border-transparent bg-[#111] text-white hover:bg-[#111]'
          : 'border-[#555] bg-white text-[#555] hover:bg-white',
      )}
    >
      {isNuevo ? 'Nuevo' : 'Seminuevo'}
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
    <div className="relative flex h-[160px] w-full shrink-0 items-center justify-center overflow-hidden sm:h-[184px]">
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
  const { showPen } = getDisplayPriceVisibility(displayCurrency);
  const penFirst = dualPriceOrder === 'pen-usd';
  const primaryClass =
    'font-price text-[17px] font-semibold leading-none tracking-tight tabular-nums sm:text-[18px]';
  const secondaryClass =
    'font-price mt-1 text-[11px] font-medium leading-normal tracking-normal tabular-nums text-[#8A8A8A] sm:text-[12px]';

  const penPrice = (
    <span className="mr-1 text-[0.78em] font-semibold tracking-normal opacity-90">S/</span>
  );
  const penAmount = product.price.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const penPrimary = (
    <p className={primaryClass} style={{ color: HAITECH_SHOP.brand }}>
      {penPrice}
      {penAmount}
    </p>
  );
  const penSecondary = (
    <p className={secondaryClass}>
      {penPrice}
      {penAmount}
    </p>
  );
  const usdPrimary = (
    <p className={primaryClass} style={{ color: HAITECH_SHOP.brand }}>
      {formatHaitechUsd(priceUsd)}
    </p>
  );
  const usdSecondary = (
    <p className={secondaryClass}>{formatHaitechUsd(priceUsd)}</p>
  );

  const compareUsd =
    product.compareAt != null ? penToUsd(product.compareAt, saleRate) : null;

  return (
    <>
      {product.compareAt != null || product.discountLabel ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {product.compareAt != null ? (
            <span className="font-price text-[10px] tabular-nums tracking-wide text-[#A0A0A0] line-through sm:text-[11px]">
              {showPen
                ? formatHaitechPen(product.compareAt)
                : compareUsd != null
                  ? formatHaitechUsd(compareUsd)
                  : formatHaitechPen(product.compareAt)}
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

      <div className={cn((product.compareAt != null || product.discountLabel) && 'mt-1.5')}>
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
      </div>
    </>
  );
}

function CardInfo({
  product,
  priceUsd,
  saleRate,
}: {
  product: HaitechShopProduct;
  priceUsd: number;
  saleRate?: number;
}) {
  const displayTitle = formatHaitechProductDisplayTitle(product);

  return (
    <div className="mt-2 flex flex-col">
      <CardConditionBadge condition={product.condition} />
      <h3
        className="line-clamp-2 text-[13px] font-bold leading-snug text-[#111] sm:text-[14px]"
        title={displayTitle}
      >
        {displayTitle}
      </h3>

      <div className="mt-4">
        <CardPriceBlock product={product} priceUsd={priceUsd} saleRate={saleRate} />
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
