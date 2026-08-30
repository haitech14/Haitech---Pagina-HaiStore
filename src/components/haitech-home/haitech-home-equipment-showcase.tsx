import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Copy,
  Droplets,
  FileText,
  Gauge,
  LayoutGrid,
  PenTool,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
} from 'lucide-react';
import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';
import useEmblaCarousel from 'embla-carousel-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import {
  filterEquipmentShowcaseProducts,
  EMPTY_EQUIPMENT_SPEC_FILTERS,
  EMPTY_FORMATO_ANCHO_SPEC_FILTERS,
  EMPTY_LAPTOP_SPEC_FILTERS,
  formatEquipmentShowcaseFullTitle,
  getShowcaseFiltersForCategory,
  HAITECH_EQUIPMENT_COLOR_MODE_FILTERS,
  HAITECH_EQUIPMENT_CONDITIONS,
  HAITECH_EQUIPMENT_FORMAT_FILTERS,
  HAITECH_FORMATO_ANCHO_COLOR_FILTERS,
  HAITECH_FORMATO_ANCHO_DEVICE_FILTERS,
  HAITECH_FORMATO_ANCHO_FORMAT_FILTERS,
  HAITECH_LAPTOP_CONDITIONS,
  HAITECH_SCANNER_CONDITIONS,
  HAITECH_LAPTOP_FILTERS,
  HAITECH_EQUIPMENT_SHOWCASE_CATEGORIES,
  HAITECH_EQUIPMENT_SHOWCASE_PAGE_SIZE,
  HAITECH_EQUIPMENT_SHOWCASE_VISIBLE,
  isEquipmentSpecFilterActive,
  isFormatoAnchoSpecFilterActive,
  isLaptopSpecFilterActive,
  resolveConsumableOrigin,
  resolveEquipmentCardSpecs,
  resolveEquipmentShowcaseCode,
  toggleEquipmentSpecFilter,
  toggleFormatoAnchoSpecFilter,
  toggleLaptopSpecFilter,
  type HaitechEquipmentActiveSpecFilters,
  type HaitechEquipmentConditionId,
  type HaitechEquipmentSpecFilterId,
  type HaitechEquipmentShowcaseCategoryId,
  type HaitechFormatoAnchoActiveFilters,
  type HaitechFormatoAnchoFilterId,
  type HaitechLaptopActiveFilters,
  type HaitechLaptopFilterId,
  resolveShowcaseConsumableKind,
  type HaitechShowcaseConsumableKind,
  type HaitechShowcaseFilterId,
} from '@/data/haitech-home-equipment-showcase';
import { HAITECH_HOME } from '@/data/haitech-home-shell';
import {
  formatHaitechPen,
  HAITECH_SHOP,
  resolveHaitechShopStockLocations,
  type HaitechShopProduct,
} from '@/data/haitech-home-shop';
import { useCart } from '@/context/cart-context';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { getCatalogRows, loadCatalogIndex } from '@/lib/catalog-featured';
import { DEFAULT_USD_TO_PEN } from '@/lib/exchange-rate';
import { buildShowcaseProductsFromCatalog } from '@/lib/showcase-catalog-consumables';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useHaitechWhatsAppQuoteContext } from '@/hooks/use-haitech-whatsapp-quote';
import { ProductStockHover } from '@/components/product/product-stock-hover';
import { CONSULTAR_PRECIO_LABEL, getDisplayPriceVisibility, isPriceOnRequest } from '@/lib/display-price';
import { PRODUCT_ON_REQUEST_STOCK_LABEL } from '@/lib/product-on-request-label';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import {
  parseStoreShowcaseLocation,
  STORE_SHOWCASE_HASH,
  storeShowcasePath,
} from '@/lib/store-showcase-path';
import { penToUsd, cn } from '@/lib/utils';
import type { Product } from '@/types/product';

const BRAND = '#E30613';

const CATEGORY_CAROUSEL_GAP = 'gap-3 sm:gap-3.5';
/** Una sola fila: ~5–7 cards visibles según viewport; el resto con flechas. */
const CATEGORY_SLIDE_CLASS =
  'min-w-0 shrink-0 grow-0 basis-[132px] sm:basis-[148px] md:basis-[156px] lg:basis-[164px] xl:basis-[172px]';

const categoryCarouselArrowClass =
  'absolute top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#555] shadow-[0_4px_14px_rgba(15,23,42,0.12)] transition-colors hover:border-[#CFCFCF] hover:text-[#111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-30 sm:size-10';

function formatHaitechUsd(usd: number): string {
  return `US$ ${usd.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function PrintModeIcon({ mode }: { mode: 'B/N' | 'Color' }) {
  if (mode === 'Color') {
    return (
      <span
        className="relative inline-block size-4 overflow-hidden rounded-full"
        aria-hidden="true"
      >
        <span className="absolute inset-0 bg-[conic-gradient(#EC008C_0deg_90deg,#111111_90deg_180deg,#FFD100_180deg_270deg,#00AEEF_270deg_360deg)]" />
      </span>
    );
  }
  return (
    <span
      className="inline-block size-4 rounded-full border border-[#CFCFCF]"
      style={{
        background: 'linear-gradient(90deg, #111 0 50%, #fff 50% 100%)',
      }}
      aria-hidden="true"
    />
  );
}

function SpecFilterIcon({
  id,
  active = false,
}: {
  id: HaitechShowcaseFilterId;
  active?: boolean;
}) {
  if (id === 'todos') return <LayoutGrid className="size-3.5" aria-hidden="true" />;
  if (id === 'a4' || id === 'a3' || id === 'a0' || id === 'a1') {
    return (
      <FileText
        className={cn('size-3.5', active ? 'text-white' : 'text-[#3B82F6]')}
        aria-hidden="true"
      />
    );
  }
  if (id === 'color') return <PrintModeIcon mode="Color" />;
  if (id === 'plotter') {
    return (
      <PenTool
        className={cn('size-3.5', active ? 'text-white' : 'text-[#3B82F6]')}
        aria-hidden="true"
      />
    );
  }
  if (id === 'multifuncional') {
    return (
      <Copy
        className={cn('size-3.5', active ? 'text-white' : 'text-[#3B82F6]')}
        aria-hidden="true"
      />
    );
  }
  if (id === 'originales') {
    return <ShieldCheck className="size-3.5 text-[#E30613]" aria-hidden="true" />;
  }
  if (id === 'compatibles') {
    return <Copy className="size-3.5 text-[#3B82F6]" aria-hidden="true" />;
  }
  if (id === 'remanufacturados') {
    return <RefreshCw className="size-3.5 text-[#6B7280]" aria-hidden="true" />;
  }
  return <PrintModeIcon mode="B/N" />;
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

function EquipmentShowcaseCard({ product }: { product: HaitechShopProduct }) {
  const { addItem } = useCart();
  const { requestQuote } = useHaitechWhatsAppQuoteContext();
  const { displayCurrency, dualPriceOrder } = useDisplayCurrency();
  const { data: companySettings } = useCompanySettings();
  const saleRate = companySettings?.usdToPenExchangeRate;
  const [imgError, setImgError] = useState(false);
  const isConsumable = Boolean(product.toner) || /repuesto|unidad de imagen|t[oó]ner/i.test(product.name);
  const isSoftware = product.showcaseCategoryIds?.includes('software') ?? false;
  const specs = resolveEquipmentCardSpecs(product);
  const consumableOrigin = isConsumable ? resolveConsumableOrigin(product) : null;
  const title = formatEquipmentShowcaseFullTitle(product);
  const isRemanufacturada = /remanufactur/i.test(product.name);
  const isSeminuevo = product.condition === 'seminuevo' && !isRemanufacturada;
  const isNuevo = !isSeminuevo && !isRemanufacturada;
  const codeLabel = resolveEquipmentShowcaseCode(product);
  const hasStock = product.stock != null;
  const stockCount = Math.max(0, Math.floor(Number(product.stock) || 0));
  const outOfStock = hasStock && stockCount <= 0;
  const cartButtonLabel = outOfStock ? 'Reservar' : 'Añadir al carrito';
  const priceUsd = penToUsd(product.price, saleRate);
  const priceOnRequest = isPriceOnRequest(priceUsd);
  const { showUsd, showPen } = getDisplayPriceVisibility(displayCurrency);
  const penFirst = dualPriceOrder === 'pen-usd';
  const compareUsd =
    product.compareAt != null ? penToUsd(product.compareAt, saleRate) : null;

  const originBadgeLabel =
    consumableOrigin === 'compatible'
      ? 'Compatible'
      : consumableOrigin === 'remanufacturado'
        ? 'Remanufacturado'
        : consumableOrigin === 'original'
          ? 'Original'
          : null;

  const priceLine = (() => {
    if (priceOnRequest) {
      return (
        <span
          className="text-[14px] font-bold text-[#6B7280] sm:text-[16px]"
        >
          {CONSULTAR_PRECIO_LABEL}
        </span>
      );
    }
    if (displayCurrency === 'PEN') {
      return (
        <span
          className="text-[14px] font-black tabular-nums sm:text-[17px]"
          style={{ color: HAITECH_SHOP.brand }}
        >
          {formatHaitechPen(product.price)}
        </span>
      );
    }
    if (displayCurrency === 'USD') {
      return (
        <span
          className="text-[14px] font-black tabular-nums sm:text-[17px]"
          style={{ color: HAITECH_SHOP.brand }}
        >
          {formatHaitechUsd(priceUsd)}
        </span>
      );
    }
    if (penFirst) {
      return (
        <span className="flex w-full flex-col items-center gap-0.5 sm:items-start">
          <span
            className="text-[14px] font-black tabular-nums sm:text-[17px]"
            style={{ color: HAITECH_SHOP.brand }}
          >
            {formatHaitechPen(product.price)}
          </span>
          <span className="text-[12px] font-semibold tabular-nums text-[#6B7280]">
            {formatHaitechUsd(priceUsd)}
          </span>
        </span>
      );
    }
    return (
      <span className="flex w-full flex-col items-center gap-0.5 sm:items-start">
        <span
          className="text-[14px] font-black tabular-nums sm:text-[17px]"
          style={{ color: HAITECH_SHOP.brand }}
        >
          {formatHaitechUsd(priceUsd)}
        </span>
        <span className="text-[12px] font-semibold tabular-nums text-[#6B7280]">
          {formatHaitechPen(product.price)}
        </span>
      </span>
    );
  })();

  const hasDiscount =
    product.compareAt != null && product.compareAt > product.price && product.price > 0;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / (product.compareAt as number)) * 100)
    : 0;

  const compareLabel = hasDiscount
    ? showPen && !showUsd
      ? formatHaitechPen(product.compareAt as number)
      : showUsd && !showPen && compareUsd != null
        ? formatHaitechUsd(compareUsd)
        : formatHaitechPen(product.compareAt as number)
    : null;

  return (
    <article
      className={cn(
        'group/card flex h-full flex-col overflow-hidden rounded-xl bg-white p-2.5',
        'shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:rounded-[1.25rem] sm:p-4',
      )}
    >
      <div className="flex items-start justify-between gap-1.5 sm:gap-2">
        <span className="min-w-0 truncate text-[10px] font-black tracking-[0.04em] text-[#E30613] sm:text-[14px]">
          {(product.brand ?? 'RICOH').toUpperCase()}
        </span>
        {isConsumable && originBadgeLabel ? (
          <span className="inline-flex h-5 shrink-0 items-center rounded-full bg-black px-2 text-[8px] font-bold uppercase tracking-wide text-white sm:h-6 sm:px-2.5 sm:text-[10px]">
            {originBadgeLabel}
          </span>
        ) : isRemanufacturada ? (
          <span className="inline-flex h-5 shrink-0 items-center rounded-full border border-emerald-600 bg-emerald-50 px-2 text-[8px] font-bold uppercase tracking-wide text-emerald-700 sm:h-6 sm:px-2.5 sm:text-[10px]">
            Remanufacturada
          </span>
        ) : isNuevo ? (
          <span className="inline-flex h-5 shrink-0 items-center rounded-full bg-black px-2 text-[8px] font-bold uppercase tracking-wide text-white sm:h-6 sm:px-2.5 sm:text-[10px]">
            Nuevo
          </span>
        ) : (
          <span className="inline-flex h-5 shrink-0 items-center rounded-full border border-[#D4D4D4] bg-white px-2 text-[8px] font-bold uppercase tracking-wide text-[#666] sm:h-6 sm:px-2.5 sm:text-[10px]">
            Seminuevo
          </span>
        )}
      </div>

      <Link
        to={product.href ?? '/tienda'}
        className="mt-1 flex min-h-[96px] flex-1 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] sm:min-h-[150px]"
        aria-label={title}
      >
        {!imgError ? (
          <img
            src={product.image}
            alt=""
            width={220}
            height={180}
            className="max-h-[108px] w-auto max-w-full object-contain sm:max-h-[150px]"
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-3xl font-bold text-[#D0D0D0]" aria-hidden="true">
            {title.charAt(0)}
          </span>
        )}
      </Link>

      <div className="relative mt-2">
        <h3
          className="line-clamp-3 text-pretty break-words text-center text-[11px] font-bold leading-snug text-[#111] sm:line-clamp-none sm:text-[14px]"
          title={title}
        >
          {title}
        </h3>

        <div
          className={cn(
            'grid min-w-0 overflow-hidden transition-[grid-template-rows,opacity,margin] duration-200 ease-out',
            'grid-rows-[0fr] opacity-0',
            'group-hover/card:mt-1.5 group-hover/card:grid-rows-[1fr] group-hover/card:opacity-100',
            'group-focus-within/card:mt-1.5 group-focus-within/card:grid-rows-[1fr] group-focus-within/card:opacity-100',
            'motion-reduce:mt-1.5 motion-reduce:grid-rows-[1fr] motion-reduce:opacity-100',
          )}
        >
          <div className="min-h-0 overflow-hidden">
            {isConsumable ? (
              <ul
                className={cn(
                  'flex flex-nowrap items-center justify-center gap-x-2 overflow-x-auto text-[10px] font-medium text-[#666]',
                  '[-ms-overflow-style:none] [scrollbar-width:none] sm:gap-x-2.5 sm:text-[11px] [&::-webkit-scrollbar]:hidden',
                )}
              >
                <li className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap" title="Tipo">
                  <ShieldCheck className="size-3.5 shrink-0 text-[#E30613]" strokeWidth={2.25} aria-hidden="true" />
                  <span>{originBadgeLabel ?? 'Suministro'}</span>
                </li>
                {product.toner?.colorLabel ? (
                  <li className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap" title="Color">
                    <Droplets className="size-3.5 shrink-0 text-[#E30613]" strokeWidth={2.25} aria-hidden="true" />
                    <span>{product.toner.colorLabel}</span>
                  </li>
                ) : null}
                {product.toner?.yieldLabel ? (
                  <li className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap" title="Rendimiento">
                    <BarChart3 className="size-3.5 shrink-0 text-[#E30613]" strokeWidth={2.25} aria-hidden="true" />
                    <span>{product.toner.yieldLabel}</span>
                  </li>
                ) : null}
              </ul>
            ) : isSoftware ? (
              <ul
                className={cn(
                  'flex flex-nowrap items-center justify-center gap-x-2 overflow-x-auto text-[10px] font-medium text-[#666]',
                  '[-ms-overflow-style:none] [scrollbar-width:none] sm:gap-x-2.5 sm:text-[11px] [&::-webkit-scrollbar]:hidden',
                )}
              >
                <li className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap" title="Formato">
                  <LayoutGrid className="size-3.5 shrink-0 text-[#E30613]" strokeWidth={2.25} aria-hidden="true" />
                  <span>Licencia DVD</span>
                </li>
                <li className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap" title="Marca">
                  <ShieldCheck className="size-3.5 shrink-0 text-[#E30613]" strokeWidth={2.25} aria-hidden="true" />
                  <span>Ricoh original</span>
                </li>
              </ul>
            ) : (
              <ul
                className={cn(
                  'flex flex-nowrap items-center justify-center gap-x-2 overflow-x-auto text-[10px] font-medium text-[#666]',
                  '[-ms-overflow-style:none] [scrollbar-width:none] sm:gap-x-2.5 sm:text-[11px] [&::-webkit-scrollbar]:hidden',
                )}
              >
                <li className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap" title="Modo de impresión">
                  <PrintModeIcon mode={specs.printMode} />
                  <span>{specs.printMode}</span>
                </li>
                <li className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap" title="Velocidad">
                  <Gauge className="size-3.5 shrink-0 text-[#E30613]" strokeWidth={2.25} aria-hidden="true" />
                  <span>{specs.speedPpm}</span>
                </li>
                <li className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap" title="Formato papel">
                  <FileText className="size-3.5 shrink-0 text-[#E30613]" strokeWidth={2.25} aria-hidden="true" />
                  <span>{specs.paperSize}</span>
                </li>
                {specs.monthlyYield !== '—' ? (
                  <li className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap" title="Rendimiento mensual">
                    <BarChart3 className="size-3.5 shrink-0 text-[#E30613]" strokeWidth={2.25} aria-hidden="true" />
                    <span>{specs.monthlyYield}</span>
                  </li>
                ) : null}
              </ul>
            )}

            {codeLabel || hasStock ? (
              <div
                className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[10px] font-medium leading-none text-[#8a93a3] sm:text-[11px]"
                aria-label={[
                  codeLabel ? `Código ${codeLabel}` : null,
                  hasStock
                    ? outOfStock
                      ? PRODUCT_ON_REQUEST_STOCK_LABEL
                      : `Stock ${stockCount}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(', ')}
              >
                {codeLabel ? (
                  <span className="min-w-0 truncate tabular-nums" title={codeLabel}>
                    Cód. {codeLabel}
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
                    className="ml-auto text-[10px] font-medium text-[#8a93a3] sm:text-[11px]"
                    iconClassName="size-3 shrink-0"
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-2 flex w-full flex-col items-center gap-0.5 sm:mt-2.5 sm:items-start">
        {product.hasVariants ? (
          <span className="text-[10px] font-semibold leading-none text-[#6B7280] sm:text-[12px]">
            Desde
          </span>
        ) : null}
        {compareLabel ? (
          <div className="flex flex-wrap items-center justify-center gap-1 sm:justify-start">
            <span className="text-[10px] font-medium tabular-nums text-[#9CA3AF] line-through decoration-[#9CA3AF] sm:text-[12px]">
              {compareLabel}
            </span>
            {discountPercent > 0 ? (
              <span className="inline-flex rounded-full bg-[#E30613] px-1 py-0.5 text-[7px] font-bold uppercase tracking-wide text-white sm:px-1.5 sm:text-[8px]">
                {discountPercent}% DSCT
              </span>
            ) : null}
          </div>
        ) : null}
        {priceLine}
      </div>

      <div className="mt-2 flex items-center gap-1.5 sm:mt-3 sm:gap-2">
        <button
          type="button"
          onClick={() => addItem(toCartProduct(product, saleRate), { openDrawer: true })}
          className={cn(
            'inline-flex h-9 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg px-1.5 sm:h-10 sm:gap-2 sm:px-2.5',
            'text-[10px] font-bold text-white sm:text-[12px]',
            'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            outOfStock
              ? 'bg-[#111111] hover:bg-[#222222] focus-visible:ring-[#111111]/40'
              : 'bg-[#E30613] hover:bg-[#c90511] focus-visible:ring-[#E30613]/40',
          )}
          aria-label={
            outOfStock
              ? `Reservar ${title} a pedido`
              : `Añadir ${title} al carrito`
          }
        >
          {!outOfStock ? (
            <ShoppingCart className="size-3.5 shrink-0 sm:size-4" strokeWidth={2} aria-hidden="true" />
          ) : null}
          <span className="truncate sm:hidden">{outOfStock ? 'Reservar' : 'Añadir'}</span>
          <span className="hidden truncate sm:inline">{cartButtonLabel}</span>
        </button>
        <button
          type="button"
          onClick={() =>
            requestQuote({
              campaign: `equipos-showcase-${product.id}`,
              extraLines: [
                `Producto: *${title}*`,
                codeLabel ? `Código: ${codeLabel}` : null,
                priceOnRequest
                  ? 'Precio: Consultar'
                  : `Precio: ${formatHaitechPen(product.price)} · ${formatHaitechUsd(priceUsd)}`,
                isConsumable
                  ? `Tipo: ${originBadgeLabel ?? 'Suministro'}${product.toner ? ` · ${product.toner.colorLabel} · ${product.toner.yieldLabel}` : ''}`
                  : `Specs: ${specs.printMode} · ${specs.speedPpm} · ${specs.paperSize}${specs.monthlyYield !== '—' ? ` · ${specs.monthlyYield}` : ''}`,
              ].filter(Boolean) as string[],
              requireDialog: true,
              title: 'Comprar por WhatsApp',
              description:
                'Completa tus datos para enviar el mensaje con el producto y el precio a nuestro equipo de ventas.',
              submitLabel: 'Enviar por WhatsApp',
            })
          }
          aria-label="Comprar por WhatsApp"
          className={cn(
            'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.65rem] sm:h-10 sm:w-10',
            'bg-[#25D366] text-white shadow-sm',
            'transition-colors hover:bg-[#20BD5A]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/50 focus-visible:ring-offset-2',
          )}
        >
          <Icon path={mdiWhatsapp} size={0.95} color="white" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

function ShowcaseCategoryCarousel({
  categoryId,
  onSelect,
}: {
  categoryId: HaitechEquipmentShowcaseCategoryId;
  onSelect: (categoryId: HaitechEquipmentShowcaseCategoryId) => void;
}) {
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    slidesToScroll: 'auto',
    watchDrag: emblaShouldWatchDrag,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelectSlide = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    onSelectSlide();
    emblaApi.on('select', onSelectSlide);
    emblaApi.on('reInit', onSelectSlide);

    return () => {
      emblaApi.off('select', onSelectSlide);
      emblaApi.off('reInit', onSelectSlide);
    };
  }, [emblaApi]);

  const canScroll = canScrollPrev || canScrollNext;

  return (
    <div className={cn('relative mx-auto max-w-[1280px]', canScroll && 'px-10 sm:px-12')}>
      {canScroll ? (
        <>
          <button
            type="button"
            className={cn(categoryCarouselArrowClass, 'left-0')}
            aria-label="Categorías anteriores"
            disabled={!canScrollPrev}
            onClick={scrollPrev}
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(categoryCarouselArrowClass, 'right-0')}
            aria-label="Categorías siguientes"
            disabled={!canScrollNext}
            onClick={scrollNext}
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </>
      ) : null}

      <div className="overflow-hidden" ref={emblaRef}>
        <ul
          className={cn('flex flex-nowrap', CATEGORY_CAROUSEL_GAP)}
          role="list"
          aria-label="Categorías de equipos"
        >
          {HAITECH_EQUIPMENT_SHOWCASE_CATEGORIES.map((category) => {
            const active = category.id === categoryId;
            return (
              <li key={category.id} className={CATEGORY_SLIDE_CLASS}>
                <button
                  type="button"
                  onClick={() => onSelect(category.id)}
                  className={cn(
                    'group relative flex h-full w-full flex-col items-center justify-center rounded-2xl bg-white px-2.5 py-4 text-center sm:px-3 sm:py-5',
                    'shadow-[0_8px_24px_rgba(15,23,42,0.07)] transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/40 focus-visible:ring-offset-2',
                    active
                      ? 'border-2 border-[#E30613] bg-[#FFF5F5]'
                      : 'border-2 border-transparent hover:-translate-y-0.5',
                  )}
                  aria-pressed={active}
                >
                  <img
                    src={category.image}
                    alt=""
                    width={160}
                    height={120}
                    className="h-[72px] w-auto max-w-full object-contain sm:h-[88px] xl:h-[80px]"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="mt-2.5 text-[12px] font-bold leading-snug text-[#111] sm:mt-3 sm:text-[13px] xl:text-[12px]">
                    {category.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/** Vitrina Equipos (/tienda): categorías + filtros + grid (mockup). */
export function HaitechHomeEquipmentShowcase({ className }: { className?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const parsed = useMemo(
    () => parseStoreShowcaseLocation(location.pathname, searchParams),
    [location.pathname, searchParams],
  );

  const [categoryId, setCategoryId] = useState<HaitechEquipmentShowcaseCategoryId>(
    () => parsed.categoryId ?? 'multifuncionales',
  );
  const [specFilter, setSpecFilter] = useState<HaitechShowcaseFilterId>(
    () => parsed.filter ?? 'todos',
  );
  const [equipmentSpecFilters, setEquipmentSpecFilters] =
    useState<HaitechEquipmentActiveSpecFilters>(
      () => parsed.equipmentSpecFilters ?? EMPTY_EQUIPMENT_SPEC_FILTERS,
    );
  const [laptopSpecFilters, setLaptopSpecFilters] = useState<HaitechLaptopActiveFilters>(
    () => parsed.laptopSpecFilters ?? EMPTY_LAPTOP_SPEC_FILTERS,
  );
  const [formatoAnchoSpecFilters, setFormatoAnchoSpecFilters] =
    useState<HaitechFormatoAnchoActiveFilters>(
      () => parsed.formatoAnchoSpecFilters ?? EMPTY_FORMATO_ANCHO_SPEC_FILTERS,
    );
  const [condition, setCondition] = useState<HaitechEquipmentConditionId>(() => {
    if (parsed.condition) return parsed.condition;
    if (parsed.categoryId === 'laptops') return 'seminuevas';
    if (parsed.categoryId === 'escaneres') return 'nuevas';
    return 'nuevas';
  });
  const [consumableKind, setConsumableKind] = useState<HaitechShowcaseConsumableKind>(
    () => parsed.consumableKind ?? 'all',
  );
  const [visibleCount, setVisibleCount] = useState(HAITECH_EQUIPMENT_SHOWCASE_VISIBLE);
  const [catalogReady, setCatalogReady] = useState(() => getCatalogRows().length > 0);
  const { data: companySettings } = useCompanySettings();
  const exchangeRate = companySettings?.usdToPenExchangeRate ?? DEFAULT_USD_TO_PEN;

  useEffect(() => {
    if (catalogReady) return;
    let cancelled = false;

    void loadCatalogIndex()
      .then(() => {
        if (!cancelled) setCatalogReady(true);
      })
      .catch(() => {
        if (!cancelled) setCatalogReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [catalogReady]);

  const catalogConsumables = useMemo(
    () => (catalogReady ? buildShowcaseProductsFromCatalog(getCatalogRows(), exchangeRate) : []),
    [catalogReady, exchangeRate],
  );

  useEffect(() => {
    if (parsed.categoryId) setCategoryId(parsed.categoryId);
    if (parsed.filter) setSpecFilter(parsed.filter);
    else if (parsed.categoryId) setSpecFilter('todos');
    if (parsed.equipmentSpecFilters) setEquipmentSpecFilters(parsed.equipmentSpecFilters);
    else if (
      parsed.categoryId &&
      parsed.categoryId !== 'laptops' &&
      parsed.categoryId !== 'formato-ancho'
    ) {
      setEquipmentSpecFilters(EMPTY_EQUIPMENT_SPEC_FILTERS);
    }
    if (parsed.laptopSpecFilters) setLaptopSpecFilters(parsed.laptopSpecFilters);
    else if (parsed.categoryId && parsed.categoryId !== 'laptops') {
      setLaptopSpecFilters(EMPTY_LAPTOP_SPEC_FILTERS);
    }
    if (parsed.formatoAnchoSpecFilters) setFormatoAnchoSpecFilters(parsed.formatoAnchoSpecFilters);
    else if (parsed.categoryId && parsed.categoryId !== 'formato-ancho') {
      setFormatoAnchoSpecFilters(EMPTY_FORMATO_ANCHO_SPEC_FILTERS);
    }
    if (parsed.condition) setCondition(parsed.condition);
    else if (parsed.categoryId === 'laptops') setCondition('seminuevas');
    else if (parsed.categoryId === 'escaneres') setCondition('nuevas');
    if (parsed.consumableKind) setConsumableKind(parsed.consumableKind);
    else if (parsed.categoryId) setConsumableKind('all');
  }, [
    parsed.categoryId,
    parsed.condition,
    parsed.consumableKind,
    parsed.filter,
    parsed.equipmentSpecFilters,
    parsed.laptopSpecFilters,
    parsed.formatoAnchoSpecFilters,
  ]);

  useEffect(() => {
    setVisibleCount(HAITECH_EQUIPMENT_SHOWCASE_VISIBLE);
  }, [
    categoryId,
    consumableKind,
    specFilter,
    equipmentSpecFilters,
    laptopSpecFilters,
    formatoAnchoSpecFilters,
    condition,
  ]);

  // Solo al llegar con #equipos-vitrina; no al cambiar filtros.
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash.replace(/^#/, '') !== STORE_SHOWCASE_HASH) return;
    const el = document.getElementById(STORE_SHOWCASE_HASH);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const syncShowcaseUrl = (next: {
    categoryId: HaitechEquipmentShowcaseCategoryId;
    filter: HaitechShowcaseFilterId;
    equipmentSpecFilters: HaitechEquipmentActiveSpecFilters;
    formatoAnchoSpecFilters: HaitechFormatoAnchoActiveFilters;
    laptopSpecFilters: HaitechLaptopActiveFilters;
    condition: HaitechEquipmentConditionId;
    consumableKind: HaitechShowcaseConsumableKind;
  }) => {
    const path = storeShowcasePath({
      categoryId: next.categoryId,
      filter: next.filter,
      equipmentSpecFilters: next.equipmentSpecFilters,
      formatoAnchoSpecFilters: next.formatoAnchoSpecFilters,
      laptopSpecFilters: next.laptopSpecFilters,
      condition: next.condition,
      consumableKind: next.consumableKind,
    });
    const url = new URL(path, window.location.origin);
    navigate(
      { pathname: url.pathname, search: url.search },
      { replace: true, preventScrollReset: true },
    );
  };

  const activeCategory = HAITECH_EQUIPMENT_SHOWCASE_CATEGORIES.find((c) => c.id === categoryId);
  const isFormatoAnchoCategory = categoryId === 'formato-ancho';
  const isLaptopCategory = categoryId === 'laptops';
  const isScannerCategory = categoryId === 'escaneres';
  const isConsumableCategory = activeCategory?.filterMode === 'consumable';
  const isEquipmentCategory = activeCategory?.filterMode === 'equipment';
  const showConditionToggle = isEquipmentCategory || isScannerCategory;
  const conditionOptions = isLaptopCategory
    ? HAITECH_LAPTOP_CONDITIONS
    : isScannerCategory
      ? HAITECH_SCANNER_CONDITIONS
      : HAITECH_EQUIPMENT_CONDITIONS;
  const activeFilters = getShowcaseFiltersForCategory(categoryId);

  const allProducts = useMemo(
    () =>
      filterEquipmentShowcaseProducts({
        categoryId,
        specFilter,
        ...(isEquipmentCategory && !isLaptopCategory && !isFormatoAnchoCategory
          ? { equipmentSpecFilters }
          : {}),
        ...(isFormatoAnchoCategory ? { formatoAnchoSpecFilters } : {}),
        ...(isLaptopCategory ? { laptopSpecFilters } : {}),
        condition,
        consumableKind: resolveShowcaseConsumableKind(categoryId, consumableKind),
        ...(categoryId === 'toner' || categoryId === 'repuestos' ? { catalogConsumables } : {}),
        limit: Number.POSITIVE_INFINITY,
      }),
    [
      categoryId,
      consumableKind,
      specFilter,
      equipmentSpecFilters,
      laptopSpecFilters,
      formatoAnchoSpecFilters,
      condition,
      catalogConsumables,
      isEquipmentCategory,
      isLaptopCategory,
      isFormatoAnchoCategory,
    ],
  );
  const products = allProducts.slice(0, visibleCount);
  const hasMoreProducts = allProducts.length > visibleCount;

  const renderFilterButton = (filter: { id: HaitechShowcaseFilterId; label: string }) => {
    const equipmentFilterId = filter.id as HaitechEquipmentSpecFilterId;
    const laptopFilterId = filter.id as HaitechLaptopFilterId;
    const formatoAnchoFilterId = filter.id as HaitechFormatoAnchoFilterId;
    const active = isLaptopCategory
      ? isLaptopSpecFilterActive(laptopSpecFilters, laptopFilterId)
      : isFormatoAnchoCategory
        ? isFormatoAnchoSpecFilterActive(formatoAnchoSpecFilters, formatoAnchoFilterId)
        : isEquipmentCategory
          ? isEquipmentSpecFilterActive(equipmentSpecFilters, equipmentFilterId)
          : filter.id === specFilter;

    const syncFilters = (next: {
      equipmentSpecFilters?: HaitechEquipmentActiveSpecFilters;
      formatoAnchoSpecFilters?: HaitechFormatoAnchoActiveFilters;
      laptopSpecFilters?: HaitechLaptopActiveFilters;
      filter?: HaitechShowcaseFilterId;
    }) => {
      syncShowcaseUrl({
        categoryId,
        filter: next.filter ?? specFilter,
        equipmentSpecFilters: next.equipmentSpecFilters ?? equipmentSpecFilters,
        formatoAnchoSpecFilters: next.formatoAnchoSpecFilters ?? formatoAnchoSpecFilters,
        laptopSpecFilters: next.laptopSpecFilters ?? laptopSpecFilters,
        condition,
        consumableKind,
      });
    };

    return (
      <button
        key={filter.id}
        type="button"
        role="tab"
        aria-selected={active}
        onClick={() => {
          if (isLaptopCategory) {
            const nextLaptopFilters = toggleLaptopSpecFilter(laptopSpecFilters, laptopFilterId);
            setLaptopSpecFilters(nextLaptopFilters);
            syncFilters({ laptopSpecFilters: nextLaptopFilters });
            return;
          }

          if (isFormatoAnchoCategory) {
            const nextFormatoAnchoFilters = toggleFormatoAnchoSpecFilter(
              formatoAnchoSpecFilters,
              formatoAnchoFilterId,
            );
            setFormatoAnchoSpecFilters(nextFormatoAnchoFilters);
            syncFilters({ formatoAnchoSpecFilters: nextFormatoAnchoFilters });
            return;
          }

          if (isEquipmentCategory) {
            const nextEquipmentFilters = toggleEquipmentSpecFilter(
              equipmentSpecFilters,
              equipmentFilterId,
            );
            setEquipmentSpecFilters(nextEquipmentFilters);
            syncFilters({ equipmentSpecFilters: nextEquipmentFilters });
            return;
          }

          const nextFilter: HaitechShowcaseFilterId =
            filter.id === specFilter ? 'todos' : filter.id;
          setSpecFilter(nextFilter);
          syncFilters({ filter: nextFilter });
        }}
        className={cn(
          'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[12px] font-semibold transition-colors sm:h-10 sm:px-4 sm:text-[13px]',
          active
            ? 'border-[#E30613] bg-[#E30613] text-white'
            : 'border-[#E5E7EB] bg-white text-[#444] hover:border-[#CFCFCF]',
        )}
      >
        <SpecFilterIcon id={filter.id} active={active} />
        {filter.label}
      </button>
    );
  };

  return (
    <section
      id="equipos-vitrina"
      className={cn('w-full bg-white px-3 pb-10 pt-6 sm:px-4 sm:pb-12 sm:pt-7 lg:px-5 lg:pb-14 lg:pt-8', className)}
      aria-labelledby="haitech-equipment-showcase-title"
    >
      <div className="mx-auto" style={{ maxWidth: HAITECH_HOME.heroMaxWidth }}>
        <header className="mb-6 text-center sm:mb-8">
          <span className="mx-auto mb-2 block h-[3px] w-7 rounded-sm bg-[#E30613]" aria-hidden="true" />
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E30613] sm:text-[12px]">
            Categorías
          </p>
          <h2
            id="haitech-equipment-showcase-title"
            className="mt-2 font-[family-name:var(--font-infobox)] text-[26px] font-bold leading-tight text-[#111] sm:text-[32px] lg:text-[36px]"
          >
            Explora nuestro <span style={{ color: BRAND }}>catálogo</span>
          </h2>
        </header>

        <ShowcaseCategoryCarousel
          categoryId={categoryId}
          onSelect={(nextCategoryId) => {
            const nextFilter: HaitechShowcaseFilterId = 'todos';
            const nextKind: HaitechShowcaseConsumableKind =
              nextCategoryId === 'toner'
                ? 'toner'
                : nextCategoryId === 'repuestos'
                  ? 'repuestos'
                  : 'all';
            const nextEquipmentFilters = EMPTY_EQUIPMENT_SPEC_FILTERS;
            const nextLaptopFilters = EMPTY_LAPTOP_SPEC_FILTERS;
            const nextFormatoAnchoFilters = EMPTY_FORMATO_ANCHO_SPEC_FILTERS;
            const nextCondition: HaitechEquipmentConditionId =
              nextCategoryId === 'laptops'
                ? 'seminuevas'
                : nextCategoryId === 'escaneres'
                  ? 'nuevas'
                  : condition;
            setCategoryId(nextCategoryId);
            setSpecFilter(nextFilter);
            setEquipmentSpecFilters(nextEquipmentFilters);
            setLaptopSpecFilters(nextLaptopFilters);
            setFormatoAnchoSpecFilters(nextFormatoAnchoFilters);
            setConsumableKind(nextKind);
            if (nextCategoryId === 'laptops' || nextCategoryId === 'escaneres') {
              setCondition(nextCondition);
            }
            syncShowcaseUrl({
              categoryId: nextCategoryId,
              filter: nextFilter,
              equipmentSpecFilters: nextEquipmentFilters,
              formatoAnchoSpecFilters: nextFormatoAnchoFilters,
              laptopSpecFilters: nextLaptopFilters,
              condition: nextCondition,
              consumableKind: nextKind,
            });
          }}
        />

        <div
          className={cn(
            'mx-auto mt-7 flex max-w-[1100px] flex-col items-center justify-center gap-3 rounded-[1.75rem] bg-[#F3F4F6] px-4 py-3.5',
            'sm:mt-8 sm:flex-row sm:rounded-full sm:px-5 sm:py-3',
          )}
        >
          <p className="shrink-0 text-[12px] font-bold uppercase tracking-[0.08em] text-[#111] sm:text-[13px]">
            Filtrar
          </p>
          <div
            className="flex flex-wrap items-center justify-center gap-2"
            role="tablist"
            aria-label={
              isConsumableCategory
                ? categoryId === 'repuestos'
                  ? 'Filtros de repuestos'
                  : 'Filtros de tóner'
                : categoryId === 'impresoras'
                  ? 'Subcategorías de impresoras'
                  : isLaptopCategory
                    ? 'Filtros de PC y laptops'
                    : isFormatoAnchoCategory
                      ? 'Filtros de formato ancho'
                    : 'Filtros de equipos'
            }
          >
            {isEquipmentCategory ? (
              isLaptopCategory ? (
                HAITECH_LAPTOP_FILTERS.map(renderFilterButton)
              ) : isFormatoAnchoCategory ? (
                <>
                  {renderFilterButton({ id: 'todos', label: 'Todos' })}
                  <span
                    className="mx-0.5 inline-block h-8 w-px shrink-0 self-center bg-[#D1D5DB]"
                    aria-hidden="true"
                  />
                  {HAITECH_FORMATO_ANCHO_FORMAT_FILTERS.map(renderFilterButton)}
                  <span
                    className="mx-0.5 inline-block h-8 w-px shrink-0 self-center bg-[#D1D5DB]"
                    aria-hidden="true"
                  />
                  {HAITECH_FORMATO_ANCHO_COLOR_FILTERS.map(renderFilterButton)}
                  <span
                    className="mx-0.5 inline-block h-8 w-px shrink-0 self-center bg-[#D1D5DB]"
                    aria-hidden="true"
                  />
                  {HAITECH_FORMATO_ANCHO_DEVICE_FILTERS.map(renderFilterButton)}
                </>
              ) : (
                <>
                  {HAITECH_EQUIPMENT_FORMAT_FILTERS.map(renderFilterButton)}
                  <span
                    className="mx-0.5 inline-block h-8 w-px shrink-0 self-center bg-[#D1D5DB]"
                    aria-hidden="true"
                  />
                  {HAITECH_EQUIPMENT_COLOR_MODE_FILTERS.map(renderFilterButton)}
                </>
              )
            ) : (
              activeFilters.map(renderFilterButton)
            )}
          </div>
        </div>

        <div className="mt-9 flex flex-col items-center gap-4 text-center sm:mt-10 sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div className="flex flex-col items-center sm:items-start">
            <span className="mb-2 block h-[3px] w-7 rounded-sm bg-[#E30613]" aria-hidden="true" />
            <h3 className="font-[family-name:var(--font-infobox)] text-[20px] font-bold tracking-tight text-[#111] sm:text-[24px] lg:text-[26px]">
              Explora nuestros{' '}
              <span style={{ color: BRAND }}>
                {isConsumableCategory
                  ? categoryId === 'repuestos'
                    ? 'repuestos'
                    : 'tóner'
                  : 'equipos'}
              </span>
            </h3>
          </div>

          {showConditionToggle ? (
            <div
              className="inline-flex self-center rounded-full border border-[#E5E7EB] bg-white p-1 shadow-sm sm:self-auto"
              role="tablist"
              aria-label="Condición del equipo"
            >
              {conditionOptions.map((item) => {
                const active = item.id === condition;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setCondition(item.id);
                      syncShowcaseUrl({
                        categoryId,
                        filter: specFilter,
                        equipmentSpecFilters,
                        formatoAnchoSpecFilters,
                        laptopSpecFilters,
                        condition: item.id,
                        consumableKind,
                      });
                    }}
                    className={cn(
                      'h-9 rounded-full px-4 text-[12px] font-semibold transition-colors sm:h-10 sm:px-5 sm:text-[13px]',
                      active ? 'bg-[#E30613] text-white' : 'bg-transparent text-[#444] hover:text-[#111]',
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {products.length > 0 ? (
          <>
            <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-6 sm:gap-4 md:grid-cols-3 lg:grid-cols-5 lg:gap-4">
              {products.map((product) => (
                <li key={product.id}>
                  <EquipmentShowcaseCard product={product} />
                </li>
              ))}
            </ul>
            {hasMoreProducts ? (
              <div className="mt-8 flex justify-center sm:mt-10">
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount((count) => count + HAITECH_EQUIPMENT_SHOWCASE_PAGE_SIZE)
                  }
                  className={cn(
                    'inline-flex h-11 items-center justify-center rounded-full border-2 border-[#E30613] bg-white px-8',
                    'text-[13px] font-bold text-[#E30613] transition-colors',
                    'hover:bg-[#E30613] hover:text-white',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/40 focus-visible:ring-offset-2',
                  )}
                >
                  Ver más
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-[#D8D8D8] bg-[#FAFAFA] px-6 py-12 text-center">
            <p className="text-[15px] font-semibold text-[#333]">
              {isConsumableCategory
                ? 'No hay suministros con estos filtros'
                : 'No hay equipos con estos filtros'}
            </p>
            <p className="mt-1 text-[13px] text-[#777]">
              Prueba otra categoría, filtro o condición.
            </p>
            <Link
              to={activeCategory?.to ?? '/tienda'}
              className="mt-4 inline-flex h-10 items-center rounded-full bg-[#E30613] px-5 text-[13px] font-semibold text-white hover:bg-[#c90511]"
            >
              Ver catálogo completo
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
