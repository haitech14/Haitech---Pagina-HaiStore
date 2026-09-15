import type { ReactNode } from 'react';

import { Star } from 'lucide-react';

import { ProductDetailComplementaCompra } from '@/components/product-detail/product-detail-complementa-compra';
import { ProductDetailMockupTrustBadges } from '@/components/product-detail/product-detail-mockup-trust-badges';
import { ProductDetailHeroDownloads } from '@/components/product-detail/product-detail-hero-downloads';
import { ProductDetailHeroSpecs } from '@/components/product-detail/product-detail-hero-specs';
import { ProductDetailHeroTrustStrip } from '@/components/product-detail/product-detail-hero-trust-strip';
import type { PurchaseMode } from '@/components/product-detail/product-detail-optional-products';
import { ProductCardSpecTable } from '@/components/product/product-card-spec-table';
import type { ConfigureHeroAccessoryCard } from '@/lib/product-configure-hero-options';
import type { EquipmentSkuVariant, EquipmentSkuVariantId } from '@/lib/equipment-sku-variants';
import {
  resolveDefaultTonerSupplyTypeForEquipment,
  type ConfigureTonerCard,
} from '@/lib/product-configure-toner';
import type { EquipmentSelectionState } from '@/lib/equipment-config-selection';
import type { NuevoEquipmentVariantId } from '@/lib/nuevo-equipment-variants';
import { resolveProductCardSpecRows } from '@/lib/product-card-short-description';
import type { Product } from '@/types/product';
import { resolveProductHeroBrand, resolveProductHeroConditionLabel } from '@/lib/product-hero-meta';
import type { SeminuevaPreparationType } from '@/lib/seminueva-preparation';
import {
  resolveSupplyCompatibleModels,
  resolveSupplyProductCardSpecRows,
  supplyRowsAsProductCardSpecRows,
} from '@/lib/supply-product-specs';
import type { EquipmentConfigStep, ProductComboItem, ProductDetailViewModel } from '@/types/product-detail';
import type { FeaturedProduct } from '@/data/featured-products';
import { cn } from '@/lib/utils';

interface ProductDetailHeroInfoProps {
  product: Product;
  detail: ProductDetailViewModel;
  featuredMeta?: Pick<FeaturedProduct, 'rating' | 'reviews' | 'isNew'> | undefined;
  tonerCards?: ConfigureTonerCard[];
  selectedTonerOptionIds?: Set<string>;
  onTonerToggle?: (card: ConfigureTonerCard) => void;
  accessoryCards?: ConfigureHeroAccessoryCard[];
  stabilizerCard?: ConfigureHeroAccessoryCard | null;
  equipmentSelection?: EquipmentSelectionState;
  onAccessoryToggle?: (card: ConfigureHeroAccessoryCard) => void;
  showPreparationTypeSelector?: boolean;
  preparationType?: SeminuevaPreparationType;
  onPreparationTypeChange?: (value: SeminuevaPreparationType) => void;
  showNuevoVariantSelector?: boolean;
  nuevoVariant?: NuevoEquipmentVariantId;
  onNuevoVariantChange?: (value: NuevoEquipmentVariantId) => void;
  equipmentSteps?: EquipmentConfigStep[];
  comboItems?: ProductComboItem[];
  afterTonerSlot?: ReactNode;
  /** Variantes u otro bloque justo debajo de Garantía de Fábrica / Ficha Técnica. */
  afterWarrantySlot?: ReactNode;
  skuVariants?: EquipmentSkuVariant[];
  selectedSkuVariantId?: EquipmentSkuVariantId;
  onSkuVariantSelect?: (variantId: EquipmentSkuVariantId) => void;
  /** Compra móvil (precio/CTAs) antes de «Complementa tu compra». */
  mobilePurchaseSlot?: ReactNode;
  purchaseMode?: PurchaseMode;
  /** Layout Ricoh mockup: título antes de rating, sin trust strip ni complementa en hero. */
  layout?: 'default' | 'mockup';
  onQuoteClick?: () => void;
  onTechnicalSheetClick?: () => void;
  onShareClick?: () => void;
  /** Oculta «Complementa tu compra» del hero (p. ej. cuando va en el sidebar). */
  hideComplementaCompra?: boolean;
  includedToner?: { name: string; code?: string; image?: string } | null;
  addableToner?: {
    optionId: string;
    name: string;
    code?: string;
    image?: string;
    yieldLabel?: string;
    priceUsd?: number;
  } | null;
  onAddableTonerToggle?: (optionId: string) => void;
}

export function ProductDetailHeroInfo({
  product,
  detail,
  featuredMeta,
  tonerCards = [],
  selectedTonerOptionIds,
  onTonerToggle,
  accessoryCards = [],
  stabilizerCard = null,
  equipmentSelection,
  onAccessoryToggle,
  afterTonerSlot,
  afterWarrantySlot,
  skuVariants = [],
  selectedSkuVariantId = 'base',
  onSkuVariantSelect,
  showPreparationTypeSelector = false,
  preparationType = 'acondicionado',
  onPreparationTypeChange,
  mobilePurchaseSlot,
  purchaseMode = 'buy',
  layout = 'default',
  onTechnicalSheetClick,
  hideComplementaCompra = false,
  addableToner = null,
  onAddableTonerToggle,
}: ProductDetailHeroInfoProps) {
  const isMockupLayout = layout === 'mockup';
  const isLaptopMockup = isMockupLayout && detail.isLaptopProduct;
  const brandLabel = resolveProductHeroBrand(product) ?? detail.brandLabel;
  const displayRating = Number(detail.rating.toFixed(1));
  const fullStars = Math.min(5, Math.max(0, Math.round(displayRating)));
  const reviewCount = featuredMeta?.reviews ?? detail.reviews;
  const skuLabel = detail.sku?.trim() || product.code?.trim();
  const soldCount = detail.soldCount;
  const conditionLabel = resolveProductHeroConditionLabel(product);
  const defaultTonerSupplyType = resolveDefaultTonerSupplyTypeForEquipment(product);
  const showBuyHeroOptions = purchaseMode !== 'rent';

  const hasTonerSection = tonerCards.length > 0;
  const hasAccessorySection = accessoryCards.length > 0;
  const hasAddableToner = Boolean(addableToner?.name?.trim());
  const hasStabilizerSection = stabilizerCard != null;
  const hasSkuVariants = skuVariants.length > 0 && onSkuVariantSelect != null;
  const hasPreparation =
    showPreparationTypeSelector === true && onPreparationTypeChange != null;
  const hasComplementaItems =
    hasTonerSection ||
    hasAccessorySection ||
    hasAddableToner ||
    hasStabilizerSection ||
    hasSkuVariants ||
    hasPreparation;
  const showComplementaCompra =
    !hideComplementaCompra &&
    showBuyHeroOptions &&
    hasComplementaItems &&
    equipmentSelection != null &&
    (!hasTonerSection || (selectedTonerOptionIds != null && onTonerToggle != null)) &&
    (!hasAccessorySection || onAccessoryToggle != null);

  const isSupply = detail.isSupplyProduct;
  const heroMetaSegments = isSupply
    ? []
    : [
        skuLabel ? { label: 'Código', value: skuLabel } : null,
        brandLabel ? { label: 'Marca', value: brandLabel } : null,
        conditionLabel ? { label: 'Condición', value: conditionLabel } : null,
      ].filter((segment): segment is { label: string; value: string } => segment != null);

  const supplySpecRows = isSupply
    ? supplyRowsAsProductCardSpecRows(resolveSupplyProductCardSpecRows(product))
    : [];
  const cardSpecRows = isSupply ? supplySpecRows : resolveProductCardSpecRows(product);
  const compatibleModels = isSupply ? resolveSupplyCompatibleModels(product) : [];
  const showHeroBullets = !isSupply && detail.heroSpecBullets.length > 0;
  const showCardSpecFallback = !showHeroBullets && cardSpecRows.length > 0;

  const heroLead = detail.heroLead?.trim() || detail.heroDescription?.trim() || '';
  const showHeroLead = !detail.isPrinterEquipment && heroLead.length > 0;

  const ratingBlock =
    reviewCount > 0 ? (
      <div
        className="flex min-w-0 flex-wrap items-center gap-2"
        aria-label={`Valoración ${displayRating} de 5, ${reviewCount} valoraciones`}
      >
        <div className="flex shrink-0 gap-0.5" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={
                index < fullStars
                  ? 'size-3.5 fill-amber-400 text-amber-400'
                  : 'size-3.5 fill-neutral-200 text-neutral-200'
              }
            />
          ))}
        </div>
        <span className="text-xs font-semibold text-neutral-700">{displayRating}</span>
        <span className="text-xs text-neutral-500">
          ({reviewCount} valoraciones de clientes)
        </span>
      </div>
    ) : null;

  const titleBlock = (
    <h1 className="text-pretty text-[1.375rem] font-bold leading-tight tracking-tight text-neutral-900 sm:text-[1.5rem] lg:text-[1.625rem]">
      {detail.heroTitle ?? product.name}
    </h1>
  );

  const titleStatsItems = [
    skuLabel ? { label: 'SKU', value: skuLabel } : null,
    { label: 'Valoraciones', value: String(reviewCount) },
    { label: 'Vendidos', value: String(soldCount) },
  ].filter((item): item is { label: string; value: string } => item != null);

  const titleStatsBlock =
    titleStatsItems.length > 0 ? (
      <p className="mt-1.5 text-[0.8125rem] leading-snug text-neutral-500 sm:text-sm">
        {titleStatsItems.map((item, index) => (
          <span key={item.label}>
            {index > 0 ? <span className="mx-1.5 text-neutral-300">·</span> : null}
            <span className="font-semibold text-neutral-700">{item.label}:</span> {item.value}
          </span>
        ))}
      </p>
    ) : null;

  const brandBlock = brandLabel ? (
    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#E31B23] sm:text-xs">
      {brandLabel}
    </p>
  ) : null;

  const subtitleBlock =
    !detail.isPrinterEquipment && detail.displaySubtitle?.trim() ? (
      <p className="text-[0.8125rem] font-medium text-neutral-500 sm:text-sm">{detail.displaySubtitle.trim()}</p>
    ) : null;

  const metaBlock =
    heroMetaSegments.length > 0 ? (
      <p className="text-xs text-neutral-900">
        {heroMetaSegments.map((segment, index) => (
          <span key={segment.label}>
            {index > 0 ? <span className="mx-1.5 text-neutral-400">·</span> : null}
            <span className="font-semibold">{segment.label}:</span> {segment.value}
          </span>
        ))}
      </p>
    ) : null;

  const leadBlock = showHeroLead ? (
    <p className="text-xs leading-snug text-neutral-600 sm:text-[0.8125rem] sm:leading-relaxed">{heroLead}</p>
  ) : null;

  const specsBlock = showHeroBullets ? (
    <ProductDetailHeroSpecs
      bullets={detail.heroSpecBullets}
      variant={isLaptopMockup ? 'grid' : 'list'}
    />
  ) : showCardSpecFallback ? (
    <ProductCardSpecTable
      rows={cardSpecRows}
      className="max-w-md"
      {...(isSupply ? { size: 'comfortable' as const } : {})}
    />
  ) : null;

  const showHeroDownloads = !isSupply && !isLaptopMockup;
  const showTrustStrip = !detail.isSupplyProduct && !isMockupLayout;
  const heroWarrantyBlock =
    showHeroDownloads && !showTrustStrip ? (
      <ProductDetailHeroDownloads product={product} showDownloads={false} showWarranty />
    ) : null;
  const heroDownloadsBlock = showHeroDownloads ? (
    <ProductDetailHeroDownloads
      product={product}
      showWarranty={false}
      {...(onTechnicalSheetClick ? { onTechnicalSheetFallback: onTechnicalSheetClick } : {})}
    />
  ) : null;

  const laptopTrustBlock = isLaptopMockup ? (
    <ProductDetailMockupTrustBadges className="mt-2.5" />
  ) : null;

  return (
    <div className="flex min-w-0 flex-col">
      {isMockupLayout ? (
        <>
          {brandBlock}
          <div className={cn(brandBlock && 'mt-1.5')}>{titleBlock}</div>
          {titleStatsBlock}
          {subtitleBlock ? <div className="mt-1">{subtitleBlock}</div> : null}
          {laptopTrustBlock}
          {leadBlock ? <div className="mt-2">{leadBlock}</div> : null}
          {specsBlock ? <div className="mt-2.5">{specsBlock}</div> : null}
          {heroWarrantyBlock ? <div className="mt-2.5">{heroWarrantyBlock}</div> : null}
        </>
      ) : (
        <>
          {brandBlock}
          {ratingBlock ? (
            <div className={cn(brandBlock && 'mt-2.5')}>{ratingBlock}</div>
          ) : null}
          <div className={cn((brandBlock || reviewCount > 0) && 'mt-2')}>{titleBlock}</div>
          {titleStatsBlock}
          {subtitleBlock ? <div className="mt-1">{subtitleBlock}</div> : null}
          {metaBlock ? <div className="mt-1">{metaBlock}</div> : null}
          {leadBlock ? <div className="mt-2">{leadBlock}</div> : null}
          {specsBlock ? <div className="mt-2.5">{specsBlock}</div> : null}
          {heroWarrantyBlock ? <div className="mt-2.5">{heroWarrantyBlock}</div> : null}
        </>
      )}

      {compatibleModels.length > 0 ? (
        <div className="mt-3 space-y-2">
          <p className="inline-flex rounded-md bg-[#1a1a1a] px-2.5 py-1 text-[0.6875rem] font-semibold text-white sm:text-xs">
            Compatibilidad:
          </p>
          <ul className="flex flex-wrap gap-1.5" aria-label="Modelos compatibles">
            {compatibleModels.map((model) => (
              <li
                key={model}
                className="inline-flex rounded-md border border-[#E5E7EB] bg-[#F3F4F6] px-2.5 py-1 text-xs font-medium text-[#374151]"
              >
                {model}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {showTrustStrip ? (
        <ProductDetailHeroTrustStrip
          product={product}
          giftSubtitle={detail.giftTrustSubtitle}
          className={showHeroBullets || showCardSpecFallback ? 'mt-1' : 'mt-3'}
        />
      ) : null}

      {afterWarrantySlot ? <div className="mt-3">{afterWarrantySlot}</div> : null}

      {mobilePurchaseSlot}

      {showComplementaCompra ? (
        <ProductDetailComplementaCompra
          tonerCards={tonerCards}
          defaultTonerSupplyType={defaultTonerSupplyType}
          accessoryCards={accessoryCards}
          stabilizerCard={stabilizerCard}
          selectedTonerOptionIds={selectedTonerOptionIds ?? new Set<string>()}
          equipmentSelection={equipmentSelection}
          onTonerToggle={onTonerToggle ?? (() => undefined)}
          onAccessoryToggle={onAccessoryToggle ?? (() => undefined)}
          addableToner={addableToner}
          {...(onAddableTonerToggle ? { onAddableTonerToggle } : {})}
          skuProduct={product}
          skuVariants={skuVariants}
          selectedSkuVariantId={selectedSkuVariantId}
          {...(onSkuVariantSelect ? { onSkuVariantSelect } : {})}
          showPreparationTypeSelector={hasPreparation}
          preparationType={preparationType}
          {...(onPreparationTypeChange ? { onPreparationTypeChange } : {})}
          variant="hero"
          {...(product.storefront_ui != null ? { storefrontUi: product.storefront_ui } : {})}
          className="mt-3.5"
        />
      ) : null}

      {heroDownloadsBlock ? (
        <div className={cn(showComplementaCompra || afterWarrantySlot ? 'mt-3' : 'mt-2.5')}>
          {heroDownloadsBlock}
        </div>
      ) : null}

      {showBuyHeroOptions ? afterTonerSlot : null}
    </div>
  );
}
