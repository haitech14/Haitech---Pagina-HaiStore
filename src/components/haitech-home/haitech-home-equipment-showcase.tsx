import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Copy,
  Cpu,
  Droplets,
  FileText,
  Gauge,
  Laptop,
  LayoutGrid,
  Microchip,
  Monitor,
  PenTool,
  Printer,
  Package,
  RefreshCw,
  ShieldCheck,
  Table2,
} from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { HaitechEquipmentShowcaseTable } from '@/components/haitech-home/haitech-equipment-showcase-table';

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
  HAITECH_IMPRESORAS_SUBTYPE_FILTERS,
  HAITECH_FORMATO_ANCHO_COLOR_FILTERS,
  HAITECH_FORMATO_ANCHO_DEVICE_FILTERS,
  HAITECH_FORMATO_ANCHO_FORMAT_FILTERS,
  HAITECH_LAPTOP_CONDITIONS,
  HAITECH_SCANNER_CONDITIONS,
  HAITECH_LAPTOP_CPU_FILTERS,
  HAITECH_LAPTOP_DEVICE_FILTERS,
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
  type HaitechEquipmentCardSpecs,
  type HaitechEquipmentShowcaseCategoryId,
  type HaitechFormatoAnchoActiveFilters,
  type HaitechFormatoAnchoFilterId,
  type HaitechLaptopActiveFilters,
  type HaitechLaptopFilterId,
  resolveShowcaseConsumableKind,
  resolveShowcaseEquipmentTecnicoUsd,
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
import { ProductQuantityAddFooter } from '@/components/product/product-quantity-add-footer';
import {
  ProductCardDefault,
  ProductCardHover,
  ProductCardHoverToggle,
  PRODUCT_CARD_PREMIUM_ADD_BUTTON_CLASS,
  PRODUCT_CARD_PREMIUM_SHELL_CLASS,
  useProductCardHoverReveal,
} from '@/components/product/product-card-premium-hover';
import { ProductTonerPricesHover } from '@/components/product/product-toner-prices-hover';
import { useAuth } from '@/context/auth-context';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { getCatalogActiveRows, loadCatalogIndex, CATALOG_INDEX_UPDATED_EVENT, subscribeCatalogMediaUpdates } from '@/lib/catalog-featured';
import { DEFAULT_USD_TO_PEN } from '@/lib/exchange-rate';
import { buildShowcaseProductsFromCatalog } from '@/lib/showcase-catalog-consumables';
import { buildShowcaseEquipmentFromCatalog, collapseShowcaseEquipmentVariants } from '@/lib/showcase-catalog-equipment';
import { findShowcaseCatalogRow, hydrateShowcaseProductsFromCatalog, resolveShowcaseMediaCatalogId, resolveShowcaseProductHref } from '@/lib/showcase-product-href';
import { resolveCatalogStock } from '@/lib/catalog-row-lookup';
import { toPublicProduct } from '@/lib/pricing';
import {
  getShowcaseDisplaySortUsd,
  resolveShowcaseActivePriceRole,
  resolveShowcaseProductPricesUsd,
  resolveShowcaseRolePriceLines,
  showcaseDisplayUsd,
  showcaseUsdToPen,
} from '@/lib/showcase-product-pricing';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useLiveProductCardMedia } from '@/hooks/use-live-product-card-media';
import { ProductStockHover } from '@/components/product/product-stock-hover';
import { isPrinterEquipment } from '@/lib/build-product-detail';
import { isDesktopTablePrinter } from '@/lib/nuevo-equipment-variants';
import { ViewAsRolePrices } from '@/components/product/view-as-role-prices';
import { ProductCardDescriptorLine } from '@/components/product/product-card-title';
import { splitProductCardTitleAtBrand } from '@/lib/product-card-title';
import { CONSULTAR_PRECIO_LABEL, getDisplayPriceVisibility, isPriceOnRequest } from '@/lib/display-price';
import { roundEquipmentDisplayUsd } from '@/lib/pen-pricing';
import { productHasOfferAttribute } from '@/lib/product-detail-badges';
import { buildProductCardHoverFeatures } from '@/lib/product-card-hover-features';
import type { ProductCardHoverFeature } from '@/lib/product-card-hover-features';
import {
  equipmentShowcaseImageSources,
  productImageMasterUrl,
  supportsResponsiveProductImage,
} from '@/lib/responsive-image';
import { resolveUserRoleDisplayPen, resolveUserRolePriceUsd, type PriceRole, type UserRole } from '@/lib/roles';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import {
  parseStoreShowcaseLocation,
  stayInShowcaseNavigateState,
  STORE_SHOWCASE_HASH,
  storeShowcaseCategoryFromPathname,
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
  const normalized = Math.round(usd * 100) / 100;
  const isWhole = Math.abs(normalized % 1) < 0.001;
  return `US$ ${normalized.toLocaleString('en-US', {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: isWhole ? 0 : 2,
  })}`;
}

function EquipmentShowcaseCardTitle({
  title,
  brand,
}: {
  title: string;
  brand?: string | null;
}) {
  const { firstLine, secondLine } = splitProductCardTitleAtBrand(title, brand);
  const modelLine = secondLine?.trim() || null;

  return (
    <>
      <span className="block w-full whitespace-nowrap leading-tight">
        <ProductCardDescriptorLine text={firstLine} />
      </span>
      {modelLine ? (
        <span className="mt-0.5 block w-full truncate whitespace-nowrap leading-tight">
          {modelLine}
        </span>
      ) : null}
    </>
  );
}

type EquipmentShowcaseGridItem =
  | { type: 'header'; id: string; label: string }
  | { type: 'product'; product: HaitechShopProduct };

function shouldShowEquipmentPrintModeSections(
  isEquipmentCategory: boolean,
  isFormatoAnchoCategory: boolean,
  isLaptopCategory: boolean,
  equipmentSpecFilters: HaitechEquipmentActiveSpecFilters,
  formatoAnchoSpecFilters: HaitechFormatoAnchoActiveFilters,
): boolean {
  if (isLaptopCategory) return false;
  if (isFormatoAnchoCategory) return formatoAnchoSpecFilters.printMode == null;
  if (isEquipmentCategory) return equipmentSpecFilters.printMode == null;
  return false;
}

function printModeSortRank(product: HaitechShopProduct): number {
  const mode = resolveEquipmentCardSpecs(product).printMode;
  if (mode === 'B/N') return 0;
  if (mode === 'Color') return 1;
  return 2;
}

function compareShowcaseGridProductsByPriceAsc(
  a: HaitechShopProduct,
  b: HaitechShopProduct,
  options: {
    saleRate: number;
    isConsumable: boolean;
    groupByPrintMode: boolean;
    viewAsRoles: readonly UserRole[];
    effectiveRole: UserRole | 'public';
  },
): number {
  const aUsd = getShowcaseDisplaySortUsd(a, options);
  const bUsd = getShowcaseDisplaySortUsd(b, options);
  const aOnRequest = aUsd <= 0;
  const bOnRequest = bUsd <= 0;
  if (aOnRequest !== bOnRequest) return aOnRequest ? 1 : -1;

  if (options.groupByPrintMode) {
    const modeDelta = printModeSortRank(a) - printModeSortRank(b);
    if (modeDelta !== 0) return modeDelta;
  }

  if (aUsd !== bUsd) return aUsd - bUsd;
  return a.name.localeCompare(b.name, 'es');
}

function buildEquipmentShowcaseGridItems(
  products: HaitechShopProduct[],
  showPrintModeSections: boolean,
): EquipmentShowcaseGridItem[] {
  if (!showPrintModeSections) {
    return products.map((product) => ({ type: 'product', product }));
  }

  const items: EquipmentShowcaseGridItem[] = [];
  let lastGroup: 'bn' | 'color' | 'other' | null = null;

  for (const product of products) {
    const printMode = resolveEquipmentCardSpecs(product).printMode;
    const group: 'bn' | 'color' | 'other' =
      printMode === 'Color' ? 'color' : printMode === 'B/N' ? 'bn' : 'other';

    if (group === 'bn' && lastGroup !== 'bn') {
      items.push({ type: 'header', id: `header-bn-${product.id}`, label: 'Blanco y Negro' });
    }
    if (group === 'color' && lastGroup !== 'color') {
      items.push({ type: 'header', id: `header-color-${product.id}`, label: 'Full Color' });
    }

    items.push({ type: 'product', product });
    lastGroup = group;
  }

  return items;
}

function EquipmentShowcaseSectionHeader({ label }: { label: string }) {
  return (
    <div className="col-span-full flex items-center gap-3 pb-1 pt-3 first:pt-0 sm:pb-1.5 sm:pt-4">
      <h3 className="shrink-0 text-[13px] font-bold uppercase tracking-[0.08em] text-[#111] sm:text-[14px]">
        {label}
      </h3>
      <span className="h-px flex-1 bg-[#E5E7EB]" aria-hidden="true" />
    </div>
  );
}

function PrintModeIcon({ mode, className }: { mode: 'B/N' | 'Color'; className?: string }) {
  if (mode === 'Color') {
    return (
      <span
        className={cn('relative inline-block size-4 shrink-0 overflow-hidden rounded-full', className)}
        aria-hidden="true"
      >
        <span className="absolute inset-0 bg-[conic-gradient(#EC008C_0deg_90deg,#111111_90deg_180deg,#FFD100_180deg_270deg,#00AEEF_270deg_360deg)]" />
      </span>
    );
  }
  return (
    <span
      className={cn('inline-block size-4 shrink-0 rounded-full border border-[#CFCFCF]', className)}
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
  if (id === 'pc') {
    return (
      <Monitor
        className={cn('size-3.5', active ? 'text-white' : 'text-[#3B82F6]')}
        aria-hidden="true"
      />
    );
  }
  if (id === 'laptop') {
    return (
      <Laptop
        className={cn('size-3.5', active ? 'text-white' : 'text-[#3B82F6]')}
        aria-hidden="true"
      />
    );
  }
  if (id === 'i5') {
    return (
      <Cpu
        className={cn('size-3.5', active ? 'text-white' : 'text-[#3B82F6]')}
        aria-hidden="true"
      />
    );
  }
  if (id === 'i7') {
    return (
      <Microchip
        className={cn('size-3.5', active ? 'text-white' : 'text-[#3B82F6]')}
        aria-hidden="true"
      />
    );
  }
  if (id === 'laser') {
    return (
      <Printer
        className={cn('size-3.5', active ? 'text-white' : 'text-[#3B82F6]')}
        aria-hidden="true"
      />
    );
  }
  if (id === 'tinta' || id === 'termica') {
    return (
      <Droplets
        className={cn('size-3.5', active ? 'text-white' : 'text-[#3B82F6]')}
        aria-hidden="true"
      />
    );
  }
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

function splitMonthlyYieldDisplay(monthlyYield: string): { amount: string; unit: string } | null {
  if (!monthlyYield || monthlyYield === '—') return null;
  const match = monthlyYield.match(/^(.+?)\s+(pags|p[aá]g(?:inas)?)\b/i);
  if (match) {
    return { amount: match[1].trim(), unit: 'pags' };
  }
  return { amount: monthlyYield.trim(), unit: 'pags' };
}

function EquipmentCardSpecRailItem({
  icon,
  value,
  title,
}: {
  icon: ReactNode;
  value: string;
  title?: string;
}) {
  return (
    <li className="flex flex-col items-center gap-0.5 text-center" title={title}>
      {icon}
      <span className="text-[9px] font-semibold leading-tight text-[#555] sm:text-[10px]">{value}</span>
    </li>
  );
}

function EquipmentCardSpecRail({ specs }: { specs: HaitechEquipmentCardSpecs }) {
  const yieldParts = splitMonthlyYieldDisplay(specs.monthlyYield);
  const yieldValue = yieldParts
    ? /\/\s*mes/i.test(yieldParts.amount)
      ? yieldParts.amount
      : `${yieldParts.amount}/mes`
    : null;

  return (
    <ul
      className={cn(
        'pointer-events-none flex w-full flex-col items-center gap-1',
        'opacity-0 transition-opacity duration-300 ease-out',
        'group-hover/card:opacity-100 group-focus-within/card:opacity-100',
        'group-data-[expanded=true]/card:opacity-100',
        'motion-reduce:opacity-100',
      )}
      aria-label="Especificaciones del equipo"
    >
      <EquipmentCardSpecRailItem
        icon={<PrintModeIcon mode={specs.printMode} className="size-3.5" />}
        value={specs.printMode}
      />
      {specs.speedPpm && specs.speedPpm !== '—' ? (
        <EquipmentCardSpecRailItem
          icon={
            <Gauge
              className="size-3 shrink-0 text-[#E30613] sm:size-3.5"
              strokeWidth={2.25}
              aria-hidden="true"
            />
          }
          value={specs.speedPpm}
          title="Velocidad"
        />
      ) : null}
      {specs.paperSize ? (
        <EquipmentCardSpecRailItem
          icon={
            <FileText
              className="size-3 shrink-0 text-[#E30613] sm:size-3.5"
              strokeWidth={2.25}
              aria-hidden="true"
            />
          }
          value={specs.paperSize}
          title="Formato"
        />
      ) : null}
      {yieldValue ? (
        <EquipmentCardSpecRailItem
          icon={
            <BarChart3
              className="size-3 shrink-0 text-[#E30613] sm:size-3.5"
              strokeWidth={2.25}
              aria-hidden="true"
            />
          }
          value={yieldValue}
          title="Rendimiento por página al mes"
        />
      ) : null}
    </ul>
  );
}

const SHOWCASE_CARD_IMAGE_CLASS =
  'mx-auto block h-auto w-[66%] max-h-[138px] origin-center object-contain object-center transition-transform duration-300 ease-out group-hover:scale-105 group-focus-within:scale-105 group-data-[expanded=true]:scale-105 motion-reduce:transform-none sm:max-h-[188px] lg:max-h-[205px]';

const SHOWCASE_CARD_IMAGE_MESA_CLASS =
  'mx-auto block h-auto w-[56%] max-h-[118px] origin-center object-contain object-center transition-transform duration-300 ease-out group-hover:scale-105 group-focus-within:scale-105 group-data-[expanded=true]:scale-105 motion-reduce:transform-none sm:max-h-[164px] lg:max-h-[178px]';

function withShowcaseImageVersion(url: string, imageVersion?: string | null): string {
  if (!imageVersion || url.startsWith('data:') || url.startsWith('blob:')) return url;
  const [path, existingQuery] = url.split('?');
  const params = new URLSearchParams(existingQuery ?? '');
  params.set('v', imageVersion);
  return `${path}?${params.toString()}`;
}

function EquipmentShowcaseCardImage({
  src,
  imageVersion = null,
  compact = false,
  onError,
}: {
  src: string;
  imageVersion?: string | null;
  compact?: boolean;
  onError: () => void;
}) {
  const imageClassName = compact ? SHOWCASE_CARD_IMAGE_MESA_CLASS : SHOWCASE_CARD_IMAGE_CLASS;
  const responsive = supportsResponsiveProductImage(src)
    ? equipmentShowcaseImageSources(src)
    : null;
  const fallbackSrc = withShowcaseImageVersion(
    responsive?.fallbackSrc ?? productImageMasterUrl(src) ?? src,
    imageVersion,
  );

  if (responsive) {
    const webpSrcSet = responsive.webpSrcSet
      .split(', ')
      .map((entry) => {
        const [url, width] = entry.split(' ');
        if (!url || !width) return entry;
        return `${withShowcaseImageVersion(url, imageVersion)} ${width}`;
      })
      .join(', ');

    return (
      <picture className="mx-auto flex w-full items-center justify-center">
        <source type="image/webp" srcSet={webpSrcSet} sizes={responsive.sizes} />
        <img
          src={fallbackSrc}
          alt=""
          className={imageClassName}
          loading="lazy"
          decoding="async"
          onError={onError}
        />
      </picture>
    );
  }

  return (
    <img
      src={fallbackSrc}
      alt=""
      className={imageClassName}
      loading="lazy"
      decoding="async"
      onError={onError}
    />
  );
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

/** Stock vivo del catálogo (incluye almacenes) + fallback de vitrina. */
function resolveShowcaseCardStock(
  product: HaitechShopProduct,
  catalogRow: ReturnType<typeof findShowcaseCatalogRow>,
): { stockCount: number; outOfStock: boolean } {
  const stockCount = resolveCatalogStock(catalogRow, product.stock);
  const hasStock = catalogRow != null || product.stock != null;
  return { stockCount, outOfStock: hasStock && stockCount <= 0 };
}

function equipmentSpecsToHoverFeatures(
  specs: HaitechEquipmentCardSpecs,
): ProductCardHoverFeature[] {
  const features: ProductCardHoverFeature[] = [
    {
      id: 'tecnologia',
      label: 'Tecnología',
      value: specs.printMode === 'Color' ? 'Color' : 'B/N monocromática',
    },
  ];
  if (specs.speedPpm && specs.speedPpm !== '—') {
    features.push({
      id: 'velocidad',
      label: 'Velocidad',
      value: /ppm/i.test(specs.speedPpm) ? specs.speedPpm : `${specs.speedPpm} ppm`,
    });
  }
  if (specs.paperSize) {
    features.push({ id: 'formato', label: 'Formato', value: specs.paperSize });
  }
  if (specs.monthlyYield) {
    features.push({ id: 'ciclo', label: 'Ciclo mensual', value: specs.monthlyYield });
  }
  return features;
}

function EquipmentShowcaseCard({
  product,
  catalogReady = false,
  showStockAndToner = false,
}: {
  product: HaitechShopProduct;
  catalogReady?: boolean;
  showStockAndToner?: boolean;
}) {
  const { viewAsRoles, effectiveRole } = useAuth();
  const hoverReveal = useProductCardHoverReveal();
  const { displayCurrency, dualPriceOrder } = useDisplayCurrency();
  const { data: companySettings } = useCompanySettings();
  const saleRate = companySettings?.usdToPenExchangeRate;
  const [imgError, setImgError] = useState(false);
  const isConsumable = Boolean(product.toner) || /repuesto|unidad de imagen|t[oó]ner/i.test(product.name);
  const liveMediaProductId = resolveShowcaseMediaCatalogId(product);
  const {
    catalogProduct: liveCatalogProduct,
    image_url: liveImageUrl,
    imageVersion,
  } = useLiveProductCardMedia(
    liveMediaProductId,
    { image: product.image },
    { loadIfMissing: catalogReady },
  );
  const catalogRow =
    liveCatalogProduct ?? (catalogReady ? findShowcaseCatalogRow(product) : undefined);
  const displayImage = liveImageUrl?.trim() || product.image;

  useEffect(() => {
    setImgError(false);
  }, [displayImage, imageVersion]);

  const pricingOptions = useMemo(
    () => ({ saleRate, isConsumable }),
    [saleRate, isConsumable],
  );
  const rolePricesUsd = useMemo(
    () => resolveShowcaseProductPricesUsd(product, pricingOptions),
    [product, pricingOptions, catalogReady, liveCatalogProduct],
  );
  const activePriceRole = resolveShowcaseActivePriceRole(viewAsRoles, effectiveRole);
  const showMultiRolePrices = viewAsRoles.length > 1;
  const viewAsRolePrices = useMemo(
    () =>
      showMultiRolePrices
        ? resolveShowcaseRolePriceLines(product, viewAsRoles, pricingOptions)
        : [],
    [product, viewAsRoles, pricingOptions, catalogReady, showMultiRolePrices, liveCatalogProduct],
  );
  const overlayTecnicoUsd = resolveShowcaseEquipmentTecnicoUsd(product);
  const activeUsdRaw =
    viewAsRoles.length === 1
      ? resolveUserRolePriceUsd(rolePricesUsd, viewAsRoles[0]!, {
          isEquipment: !isConsumable,
          saleRate,
          productKeys: [product.id, product.code],
        })
      : rolePricesUsd[activePriceRole] ?? rolePricesUsd.public;
  const priceUsd =
    isConsumable || activePriceRole === 'tecnico'
      ? Math.max(0, overlayTecnicoUsd ?? activeUsdRaw)
      : showcaseDisplayUsd(activeUsdRaw, { isConsumable });
  const displayPen =
    viewAsRoles.length === 1
      ? resolveUserRoleDisplayPen(rolePricesUsd, viewAsRoles[0]!, {
          isEquipment: !isConsumable,
          saleRate,
          productKeys: [product.id, product.code],
          penFromUsd: (usd) => showcaseUsdToPen(usd, pricingOptions),
        })
      : showcaseUsdToPen(activeUsdRaw, pricingOptions);
  const priceOnRequest = isPriceOnRequest(priceUsd);
  const { showUsd, showPen } = getDisplayPriceVisibility(displayCurrency);
  const penFirst = dualPriceOrder === 'pen-usd';
  const showPublicCompare = activePriceRole === 'public' && !showMultiRolePrices;
  const rawCompareUsd =
    showPublicCompare && product.compareAt != null
      ? penToUsd(product.compareAt, saleRate)
      : null;
  const compareUsd =
    rawCompareUsd != null
      ? isConsumable
        ? rawCompareUsd
        : roundEquipmentDisplayUsd(rawCompareUsd)
      : null;

  const isSoftware = product.showcaseCategoryIds?.includes('software') ?? false;
  const isMonitorCard =
    (product.showcaseCategoryIds?.includes('monitores') ?? false) ||
    product.productTypeLabel === 'Monitor' ||
    /\bmonitor\b/i.test(product.name);
  const isLaptopCard = product.showcaseCategoryIds?.includes('laptops') ?? false;
  const specs = resolveEquipmentCardSpecs(product);
  const hoverFeatures = useMemo(() => {
    if (catalogRow) return buildProductCardHoverFeatures(catalogRow);
    return equipmentSpecsToHoverFeatures(specs);
  }, [catalogRow, specs]);
  const consumableOrigin = isConsumable ? resolveConsumableOrigin(product) : null;
  const title = formatEquipmentShowcaseFullTitle(product);
  const isRemanufacturada = /remanufactur/i.test(product.name);
  const isSeminuevo = product.condition === 'seminuevo' && !isRemanufacturada;
  const codeLabel = resolveEquipmentShowcaseCode(product);
  const { stockCount, outOfStock } = resolveShowcaseCardStock(product, catalogRow);
  const cartProduct = useMemo(
    () =>
      toCartProduct(
        { ...product, price: displayPen, image: displayImage, stock: stockCount },
        saleRate,
      ),
    [product, displayPen, displayImage, stockCount, saleRate],
  );
  const isOffer =
    product.isOffer === true || (catalogRow != null && productHasOfferAttribute(catalogRow));
  const tonerEquipmentProduct = useMemo(
    () => (catalogRow ? toPublicProduct(catalogRow, String(effectiveRole)) : cartProduct),
    [cartProduct, catalogRow, effectiveRole],
  );
  const showTecnicoToner =
    !isConsumable &&
    activePriceRole === 'tecnico' &&
    !showMultiRolePrices &&
    !priceOnRequest;
  const showTonerPanel =
    showStockAndToner &&
    !isConsumable &&
    !isSoftware &&
    isPrinterEquipment(tonerEquipmentProduct);

  const originBadgeLabel =
    consumableOrigin === 'compatible'
      ? 'Compatible'
      : consumableOrigin === 'remanufacturado'
        ? 'Remanufacturado'
        : consumableOrigin === 'original'
          ? 'Original'
          : null;

  const offerBesidePrice =
    isOffer && !(showMultiRolePrices && viewAsRolePrices.length > 1) ? (
      <span className="inline-flex h-[18px] shrink-0 items-center rounded-full bg-[#E30613] px-2 text-[8px] font-bold uppercase tracking-wide text-white sm:h-5 sm:px-2.5 sm:text-[9px]">
        OFERTA
      </span>
    ) : null;

  const primaryPriceClass =
    'text-[14px] font-black tabular-nums sm:text-[17px]';

  const withOfferBeside = (priceNode: ReactNode) => (
    <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-1.5">
      <span className={primaryPriceClass} style={{ color: HAITECH_SHOP.brand }}>
        {priceNode}
      </span>
      {offerBesidePrice}
    </span>
  );

  const priceLine = (() => {
    if (showMultiRolePrices && viewAsRolePrices.length > 1) {
      return (
        <ViewAsRolePrices
          rolePrices={viewAsRolePrices}
          alwaysBoth
          compact
          className="w-full text-left"
        />
      );
    }
    if (priceOnRequest) {
      return (
        <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-1.5">
          <span className="text-[14px] font-bold text-[#6B7280] sm:text-[16px]">
            {CONSULTAR_PRECIO_LABEL}
          </span>
          {offerBesidePrice}
        </span>
      );
    }

    if (displayCurrency === 'PEN') {
      return (
        <span className="flex w-full flex-col items-center gap-0.5 text-center">
          {withOfferBeside(formatHaitechPen(displayPen))}
        </span>
      );
    }
    if (displayCurrency === 'USD') {
      return (
        <span className="flex w-full flex-col items-center gap-0.5 text-center">
          {withOfferBeside(formatHaitechUsd(priceUsd))}
        </span>
      );
    }
    if (penFirst) {
      return (
        <span className="flex w-full flex-col items-center gap-0.5 text-center">
          {withOfferBeside(formatHaitechPen(displayPen))}
          <span className="text-[12px] font-semibold tabular-nums text-[#6B7280]">
            {formatHaitechUsd(priceUsd)}
          </span>
        </span>
      );
    }
    return (
      <span className="flex w-full flex-col items-center gap-0.5 text-center">
        {withOfferBeside(formatHaitechUsd(priceUsd))}
        <span className="text-[12px] font-semibold tabular-nums text-[#6B7280]">
          {formatHaitechPen(displayPen)}
        </span>
      </span>
    );
  })();

  const hasDiscount =
    showPublicCompare &&
    product.compareAt != null &&
    product.compareAt > displayPen &&
    displayPen > 0;
  const discountPercent = hasDiscount
    ? Math.round((1 - displayPen / (product.compareAt as number)) * 100)
    : 0;

  const compareLabel = hasDiscount
    ? showPen && !showUsd
      ? formatHaitechPen(product.compareAt as number)
      : showUsd && !showPen && compareUsd != null
        ? formatHaitechUsd(compareUsd)
        : formatHaitechPen(product.compareAt as number)
    : null;

  const productHref = useMemo(
    () => resolveShowcaseProductHref(product),
    [product, catalogReady],
  );

  if (imgError && !isConsumable && !isSoftware && !isMonitorCard && !isLaptopCard) return null;

  return (
    <article
      className={cn(
        'group group/card flex h-full flex-col overflow-hidden border-0 bg-white p-2',
        PRODUCT_CARD_PREMIUM_SHELL_CLASS,
        'shadow-[0_4px_18px_rgba(15,23,42,0.07)] sm:p-2.5',
      )}
      {...hoverReveal.cardProps}
    >
      <Link
        to={productHref}
        className={cn(
          'flex min-h-0 flex-1 flex-col text-inherit no-underline outline-none',
          'rounded-lg focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
        )}
        aria-label={`Ver ficha de ${title}`}
      >
      <div className="relative min-h-[145px] w-full flex-1 overflow-hidden sm:min-h-[190px] lg:min-h-[210px]">
        <div className="absolute inset-0 flex items-center justify-center px-1">
          {!imgError ? (
            <EquipmentShowcaseCardImage
              src={displayImage}
              imageVersion={imageVersion}
              compact={isDesktopTablePrinter(product)}
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-3xl font-bold text-[#D0D0D0]" aria-hidden="true">
              {title.charAt(0)}
            </span>
          )}
        </div>
        {!isConsumable && !isSoftware && !isMonitorCard && !isLaptopCard ? (
          <div className="pointer-events-none relative z-[2] ml-auto flex min-h-[145px] w-[5.35rem] shrink-0 flex-col items-end gap-1.5 pt-0.5 sm:min-h-[190px] sm:w-[6.25rem] sm:gap-2 lg:min-h-[210px]">
            <EquipmentCardSpecRail specs={specs} />
          </div>
        ) : null}
      </div>

      <div className="relative mt-1 w-full">
        <h3
          className="flex w-full flex-col items-center gap-0.5 text-center text-[11px] font-bold leading-snug text-[#111] sm:text-[14px]"
          title={title}
        >
          <EquipmentShowcaseCardTitle title={title} brand={product.brand ?? null} />
        </h3>

        <div
          className="mt-1.5 flex w-full min-w-0 items-center justify-between gap-2 text-[10px] font-medium leading-none text-[#8a93a3] sm:text-[11px]"
          aria-label={[
            codeLabel ? `Código ${codeLabel}` : null,
            outOfStock ? 'Sin stock' : `Stock ${stockCount}`,
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
          <ProductStockHover
            stock={stockCount}
            outOfStock={outOfStock}
            stockLocations={resolveHaitechShopStockLocations({
              ...product,
              stock: stockCount,
            })}
            prefix="Stock "
            className="ml-auto shrink-0 text-[10px] font-medium sm:text-[11px]"
            iconClassName="size-3.5 shrink-0 text-[#E30613]"
          />
        </div>

        <div
          className={cn(
            'grid min-w-0 overflow-hidden transition-[grid-template-rows,opacity,margin] duration-200 ease-out',
            'grid-rows-[0fr] opacity-0',
            'group-hover/card:mt-1.5 group-hover/card:grid-rows-[1fr] group-hover/card:opacity-100',
            'group-focus-within/card:mt-1.5 group-focus-within/card:grid-rows-[1fr] group-focus-within/card:opacity-100',
            'group-data-[expanded=true]/card:mt-1.5 group-data-[expanded=true]/card:grid-rows-[1fr] group-data-[expanded=true]/card:opacity-100',
            'motion-reduce:mt-1.5 motion-reduce:grid-rows-[1fr] motion-reduce:opacity-100',
          )}
        >
          <div className="min-h-0 w-full overflow-hidden text-left">
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
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-2 flex w-full flex-col items-center gap-0.5 text-center sm:mt-2.5">
        {product.hasVariants ? (
          <span className="text-[10px] font-semibold leading-none text-[#6B7280] sm:text-[12px]">
            Desde
          </span>
        ) : null}
        {compareLabel ? (
          <div className="flex flex-wrap items-center justify-center gap-1">
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
      </Link>

      <ProductCardDefault className="mt-1">
        <ProductCardHoverToggle
          expanded={hoverReveal.expanded}
          productName={title}
          onToggle={hoverReveal.toggleExpanded}
        />
        <ProductCardHover
          features={isConsumable || isSoftware ? hoverFeatures : []}
          detailHref={productHref}
          productName={title}
        />
      </ProductCardDefault>

      {showTonerPanel ? (
        <ProductTonerPricesHover
          product={tonerEquipmentProduct}
          isColor={specs.printMode === 'Color'}
          priceRole={activePriceRole === 'tecnico' ? 'tecnico' : 'public'}
          {...(saleRate != null ? { saleRate } : {})}
          placement="below"
          alwaysVisible
          className="mt-1 flex flex-col items-center"
        >
          <span className="sr-only">Tóner</span>
        </ProductTonerPricesHover>
      ) : showTecnicoToner ? (
        <ProductTonerPricesHover
          product={tonerEquipmentProduct}
          isColor={specs.printMode === 'Color'}
          priceRole="tecnico"
          {...(saleRate != null ? { saleRate } : {})}
          placement="below"
          className="mt-1 flex flex-col items-center"
        >
          <span
            tabIndex={0}
            className="cursor-help text-[10px] font-semibold leading-none text-[#6B7280] underline decoration-dotted decoration-[#C4C9D2] underline-offset-2 sm:text-[11px]"
          >
            Precio Técnico
          </span>
        </ProductTonerPricesHover>
      ) : null}

      <div className="mt-2 flex justify-center sm:mt-3">
        <ProductQuantityAddFooter
          product={cartProduct}
          size="sm"
          addLabel={outOfStock ? (isSeminuevo ? 'Agotado' : 'Agregar a Pedido') : 'Agregar al carrito'}
          addLabelHover={outOfStock ? (isSeminuevo ? 'Agotado' : 'Agregar a Pedido') : 'Agregar'}
          revealQuantityOnHover
          centeredActions
          quantityClassName="h-9 rounded-lg sm:h-10"
          addButtonClassName={cn(
            PRODUCT_CARD_PREMIUM_ADD_BUTTON_CLASS,
            'h-10 min-h-10 max-h-10 w-auto flex-none justify-center rounded-lg px-3.5 text-[11px] font-bold shadow-none sm:h-11 sm:min-h-11 sm:max-h-11 sm:px-4 sm:text-[13px]',
            'border-[#E30613] bg-[#E30613] hover:border-[#c90511] hover:bg-[#c90511]',
          )}
          endAdornment={
            <span
              className={cn(
                'flex h-10 items-center overflow-hidden sm:h-11',
                'max-w-0 opacity-0',
                'transition-[max-width,opacity] duration-200 ease-out motion-reduce:transition-none',
                'group-hover:max-w-[4.5rem] group-hover:opacity-100',
                'group-focus-within:max-w-[4.5rem] group-focus-within:opacity-100',
                'group-data-[expanded=true]:max-w-[4.5rem] group-data-[expanded=true]:opacity-100',
                'max-md:max-w-[4.5rem] max-md:opacity-100',
                'motion-reduce:max-w-[4.5rem] motion-reduce:opacity-100',
              )}
            >
              <ProductStockHover
                stock={stockCount}
                outOfStock={false}
                stockLocations={resolveHaitechShopStockLocations({
                  ...product,
                  stock: stockCount,
                })}
                className="gap-0.5 px-1 text-[10px] font-semibold leading-none text-[#9A9A9A] sm:text-[11px]"
                iconClassName="size-3.5 shrink-0 text-[#9A9A9A] sm:size-4"
              />
            </span>
          }
        />
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
    <div className="relative mx-auto max-w-[1280px]">
      {canScroll ? (
        <>
          <button
            type="button"
            className={cn(categoryCarouselArrowClass, 'left-1 z-20 sm:left-2')}
            aria-label="Categorías anteriores"
            disabled={!canScrollPrev}
            onClick={scrollPrev}
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(categoryCarouselArrowClass, 'right-1 z-20 sm:right-2')}
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
  const { viewAsRoles, effectiveRole } = useAuth();
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
  const [condition, setCondition] = useState<HaitechEquipmentConditionId>(
    () => parsed.condition ?? 'nuevas',
  );
  const [showStockAndToner, setShowStockAndToner] = useState(false);
  const [showTableView, setShowTableView] = useState(false);
  const [consumableKind, setConsumableKind] = useState<HaitechShowcaseConsumableKind>(
    () => parsed.consumableKind ?? 'all',
  );
  const [visibleCount, setVisibleCount] = useState(HAITECH_EQUIPMENT_SHOWCASE_VISIBLE);
  const [catalogReady, setCatalogReady] = useState(() => getCatalogActiveRows().length > 0);
  const [catalogRevision, setCatalogRevision] = useState(0);
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

  useEffect(() => {
    const bump = () => setCatalogRevision((current) => current + 1);
    window.addEventListener(CATALOG_INDEX_UPDATED_EVENT, bump);
    const unsubscribe = subscribeCatalogMediaUpdates(bump);
    return () => {
      window.removeEventListener(CATALOG_INDEX_UPDATED_EVENT, bump);
      unsubscribe();
    };
  }, []);

  const catalogConsumables = useMemo(
    () => (catalogReady ? buildShowcaseProductsFromCatalog(getCatalogActiveRows(), exchangeRate) : []),
    [catalogReady, catalogRevision, exchangeRate],
  );
  const catalogEquipment = useMemo(
    () => (catalogReady ? buildShowcaseEquipmentFromCatalog(getCatalogActiveRows(), exchangeRate) : []),
    [catalogReady, catalogRevision, exchangeRate],
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
    else setCondition('nuevas');
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
    const currentCategory = storeShowcaseCategoryFromPathname(location.pathname);
    const keepCurrentPath =
      next.categoryId === categoryId &&
      (currentCategory == null || currentCategory === next.categoryId);

    navigate(
      {
        pathname: keepCurrentPath ? location.pathname : url.pathname,
        search: url.search,
      },
      { replace: true, preventScrollReset: true, state: stayInShowcaseNavigateState() },
    );
  };

  const activeCategory = HAITECH_EQUIPMENT_SHOWCASE_CATEGORIES.find((c) => c.id === categoryId);
  const isFormatoAnchoCategory = categoryId === 'formato-ancho';
  const isImpresorasCategory = categoryId === 'impresoras';
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
    () => {
      const filtered = filterEquipmentShowcaseProducts({
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
        catalogEquipment,
        limit: Number.POSITIVE_INFINITY,
      });
      const list = collapseShowcaseEquipmentVariants(
        catalogReady ? hydrateShowcaseProductsFromCatalog(filtered) : filtered,
      );
      const visibleList =
        condition === 'seminuevas'
          ? list.filter((product) => Math.max(0, Math.floor(Number(product.stock) || 0)) > 0)
          : list;
      const groupByPrintMode = shouldShowEquipmentPrintModeSections(
        isEquipmentCategory,
        isFormatoAnchoCategory,
        isLaptopCategory,
        equipmentSpecFilters,
        formatoAnchoSpecFilters,
      );
      return [...visibleList].sort((a, b) =>
        compareShowcaseGridProductsByPriceAsc(a, b, {
          saleRate: exchangeRate,
          isConsumable: isConsumableCategory,
          groupByPrintMode,
          viewAsRoles,
          effectiveRole,
        }),
      );
    },
    [
      categoryId,
      consumableKind,
      specFilter,
      equipmentSpecFilters,
      laptopSpecFilters,
      formatoAnchoSpecFilters,
      condition,
      catalogConsumables,
      catalogEquipment,
      isEquipmentCategory,
      isLaptopCategory,
      isFormatoAnchoCategory,
      isConsumableCategory,
      catalogReady,
      catalogRevision,
      exchangeRate,
      viewAsRoles,
      effectiveRole,
    ],
  );
  const products = allProducts.slice(0, visibleCount);
  const hasMoreProducts = allProducts.length > visibleCount;
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMoreProducts) return;
    const node = loadMoreSentinelRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisibleCount((count) => {
          if (count >= allProducts.length) return count;
          return count + HAITECH_EQUIPMENT_SHOWCASE_PAGE_SIZE;
        });
      },
      { rootMargin: '480px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [allProducts.length, hasMoreProducts, visibleCount]);
  const showPrintModeSections = shouldShowEquipmentPrintModeSections(
    isEquipmentCategory,
    isFormatoAnchoCategory,
    isLaptopCategory,
    equipmentSpecFilters,
    formatoAnchoSpecFilters,
  );
  const productGridItems = buildEquipmentShowcaseGridItems(products, showPrintModeSections);

  const isImpresoraSubtypeFilter = (filterId: HaitechShowcaseFilterId) =>
    filterId === 'todos' ||
    filterId === 'laser' ||
    filterId === 'tinta' ||
    filterId === 'termica' ||
    filterId === 'matricial';

  const renderFilterButton = (filter: { id: HaitechShowcaseFilterId; label: string }) => {
    const equipmentFilterId = filter.id as HaitechEquipmentSpecFilterId;
    const laptopFilterId = filter.id as HaitechLaptopFilterId;
    const formatoAnchoFilterId = filter.id as HaitechFormatoAnchoFilterId;
    const useImpresoraSubtype = isImpresorasCategory && isImpresoraSubtypeFilter(filter.id);
    const active = isLaptopCategory
      ? isLaptopSpecFilterActive(laptopSpecFilters, laptopFilterId)
      : isFormatoAnchoCategory
        ? isFormatoAnchoSpecFilterActive(formatoAnchoSpecFilters, formatoAnchoFilterId)
        : useImpresoraSubtype
          ? filter.id === specFilter
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

          if (useImpresoraSubtype) {
            setSpecFilter(filter.id);
            syncFilters({ filter: filter.id });
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
      className={cn('w-full bg-[#F3F4F6] px-3 pb-8 pt-3 sm:px-4 sm:pb-10 sm:pt-3.5 lg:px-5 lg:pb-12 lg:pt-4', className)}
      aria-labelledby="haitech-equipment-showcase-title"
    >
      <div className="mx-auto" style={{ maxWidth: HAITECH_HOME.heroMaxWidth }}>
        <header className="mb-3 text-center sm:mb-4">
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
              nextCategoryId === 'laptops' || nextCategoryId === 'escaneres' ? 'nuevas' : condition;
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
            'mx-auto mt-7 flex max-w-[1280px] flex-col items-center justify-center gap-3 rounded-[1.75rem] bg-[#F3F4F6] px-4 py-3.5',
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
                  ? 'Tipo de impresora y filtros de equipos'
                  : isLaptopCategory
                    ? 'Filtros de PC y laptops'
                    : isFormatoAnchoCategory
                      ? 'Filtros de formato ancho'
                    : 'Filtros de equipos'
            }
          >
            {isEquipmentCategory ? (
              isLaptopCategory ? (
                <>
                  {renderFilterButton({ id: 'todos', label: 'Todos' })}
                  <span
                    className="mx-0.5 inline-block h-8 w-px shrink-0 self-center bg-[#D1D5DB]"
                    aria-hidden="true"
                  />
                  {HAITECH_LAPTOP_DEVICE_FILTERS.map(renderFilterButton)}
                  <span
                    className="mx-0.5 inline-block h-8 w-px shrink-0 self-center bg-[#D1D5DB]"
                    aria-hidden="true"
                  />
                  {HAITECH_LAPTOP_CPU_FILTERS.map(renderFilterButton)}
                </>
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
              ) : isImpresorasCategory ? (
                <>
                  {HAITECH_IMPRESORAS_SUBTYPE_FILTERS.map(renderFilterButton)}
                  <span
                    className="mx-0.5 inline-block h-8 w-px shrink-0 self-center bg-[#D1D5DB]"
                    aria-hidden="true"
                  />
                  {HAITECH_EQUIPMENT_FORMAT_FILTERS.filter((filter) => filter.id !== 'todos').map(
                    renderFilterButton,
                  )}
                  <span
                    className="mx-0.5 inline-block h-8 w-px shrink-0 self-center bg-[#D1D5DB]"
                    aria-hidden="true"
                  />
                  {HAITECH_EQUIPMENT_COLOR_MODE_FILTERS.map(renderFilterButton)}
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

          {showConditionToggle || products.length > 0 ? (
            <div className="inline-flex items-center gap-2 self-center sm:self-auto">
              {showConditionToggle ? (
                <>
                  <div
                    className="inline-flex rounded-full border border-[#E5E7EB] bg-white p-1 shadow-sm"
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
                  <button
                    type="button"
                    aria-pressed={showStockAndToner}
                    aria-label={
                      showStockAndToner ? 'Ocultar stock y tóner' : 'Mostrar stock y tóner'
                    }
                    title="Stock y tóner"
                    onClick={() => setShowStockAndToner((value) => !value)}
                    className={cn(
                      'inline-flex h-9 items-center gap-1 rounded-full border px-2.5 shadow-sm sm:h-10 sm:px-3',
                      'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/40 focus-visible:ring-offset-2',
                      showStockAndToner
                        ? 'border-[#E30613] bg-[#E30613] text-white'
                        : 'border-[#E5E7EB] bg-white text-[#555] hover:text-[#111]',
                    )}
                  >
                    <Package className="size-4 shrink-0" strokeWidth={2.25} aria-hidden="true" />
                    <Droplets className="size-4 shrink-0" strokeWidth={2.25} aria-hidden="true" />
                  </button>
                </>
              ) : null}
              <button
                type="button"
                aria-pressed={showTableView}
                aria-label={showTableView ? 'Ver como tarjetas' : 'Ver como tabla'}
                title={showTableView ? 'Vista tarjetas' : 'Vista tabla'}
                onClick={() => setShowTableView((value) => !value)}
                className={cn(
                  'inline-flex h-9 items-center justify-center rounded-full border px-2.5 shadow-sm sm:h-10 sm:px-3',
                  'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/40 focus-visible:ring-offset-2',
                  showTableView
                    ? 'border-[#E30613] bg-[#E30613] text-white'
                    : 'border-[#E5E7EB] bg-white text-[#555] hover:text-[#111]',
                )}
              >
                <Table2 className="size-4 shrink-0" strokeWidth={2.25} aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>

        {products.length > 0 ? (
          <>
            {showTableView ? (
              <HaitechEquipmentShowcaseTable
                items={productGridItems}
                catalogReady={catalogReady}
                showStockAndToner={showStockAndToner}
              />
            ) : (
              <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-6 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
                {productGridItems.map((item) =>
                  item.type === 'header' ? (
                    <li key={item.id} className="col-span-full list-none">
                      <EquipmentShowcaseSectionHeader label={item.label} />
                    </li>
                  ) : (
                    <li key={item.product.id} className="empty:hidden">
                      <EquipmentShowcaseCard
                        product={item.product}
                        catalogReady={catalogReady}
                        showStockAndToner={showStockAndToner}
                      />
                    </li>
                  ),
                )}
              </ul>
            )}
            {hasMoreProducts ? (
              <div
                ref={loadMoreSentinelRef}
                className="h-8 w-full sm:h-10"
                aria-hidden="true"
              />
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
