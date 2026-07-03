import { Star } from 'lucide-react';
import type { ReactNode } from 'react';

import { ON_REQUEST_STOCK_BADGE_CLASS, isProductOutOfStock } from '@/components/cart/add-to-cart-button';
import { ProductDetailHeroSpecs } from '@/components/product-detail/product-detail-hero-specs';
import { ProductDetailHeroTonerSelector } from '@/components/product-detail/product-detail-hero-toner-selector';
import { ProductDetailPreparationTypeSelector } from '@/components/product-detail/product-detail-preparation-type-selector';
import { ProductConditionBadge } from '@/components/product/product-condition-badge';
import { ProductQuickViewFeaturePills } from '@/components/product/product-quick-view-feature-pills';
import type { ConfigureTonerCard } from '@/lib/product-configure-toner';
import {
  resolveProductEquipmentConditionLabel,
  resolveProductHeroBrand,
  resolveProductStockAvailability,
} from '@/lib/product-hero-meta';
import type { SeminuevaPreparationType } from '@/lib/seminueva-preparation';
import { cn } from '@/lib/utils';
import type { ProductDetailViewModel } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductDetailHeroInfoProps {
  product: Product;
  detail: ProductDetailViewModel;
  tonerCards?: ConfigureTonerCard[];
  selectedTonerOptionIds?: Set<string>;
  onTonerToggle?: (card: ConfigureTonerCard) => void;
  showPreparationTypeSelector?: boolean;
  preparationType?: SeminuevaPreparationType;
  onPreparationTypeChange?: (value: SeminuevaPreparationType) => void;
  afterTonerSlot?: ReactNode;
}

export function ProductDetailHeroInfo({
  product,
  detail,
  tonerCards = [],
  selectedTonerOptionIds,
  onTonerToggle,
  showPreparationTypeSelector = false,
  preparationType = 'acondicionada',
  onPreparationTypeChange,
  afterTonerSlot,
}: ProductDetailHeroInfoProps) {
  const outOfStock = isProductOutOfStock(product);
  const brandLabel = resolveProductHeroBrand(product) ?? detail.brandLabel;
  const stockAvailability = resolveProductStockAvailability(product, outOfStock);
  const conditionLabel = resolveProductEquipmentConditionLabel(product);
  const displayRating = Number(detail.rating.toFixed(1));
  const fullStars = Math.min(5, Math.max(0, Math.round(displayRating)));

  return (
    <div className="flex min-w-0 flex-col">
      {brandLabel ? (
        <p className="text-xs font-bold uppercase tracking-wider text-primary sm:text-sm">
          {brandLabel}
        </p>
      ) : null}

      <div className="mt-1 flex items-start justify-between gap-3">
        <h1 className="min-w-0 flex-1 text-pretty text-xl font-bold leading-snug text-[#0f1f3d] sm:text-2xl lg:text-[1.65rem] lg:leading-tight">
          {detail.heroTitle ?? product.name}
        </h1>
        {conditionLabel ? (
          <ProductConditionBadge label={conditionLabel} size="overlay" className="mt-0.5 shrink-0" />
        ) : null}
      </div>

      <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
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
                  index < fullStars
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-neutral-200 text-neutral-200',
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground sm:text-sm">
            {displayRating.toFixed(1)} ({detail.reviews} opiniones)
          </span>
        </div>
      </div>

      <div className="mt-2">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
            stockAvailability.tone === 'unavailable' && ON_REQUEST_STOCK_BADGE_CLASS,
            stockAvailability.tone === 'low' && 'bg-amber-50 text-amber-800',
            stockAvailability.tone === 'available' && 'bg-emerald-50 text-emerald-700',
          )}
        >
          {stockAvailability.tone === 'available' ? (
            <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
          ) : null}
          {stockAvailability.label}
        </span>
      </div>

      {detail.specPills.length > 0 ? (
        <ProductQuickViewFeaturePills items={detail.specPills} className="mt-3 w-full" />
      ) : null}

      <ProductDetailHeroSpecs bullets={detail.heroSpecBullets} pills={[]} />

      {detail.heroLead ? (
        <p className="mt-3 text-sm font-semibold leading-snug text-[#0f1f3d] sm:text-base">
          {detail.heroLead}
        </p>
      ) : null}

      {detail.heroDescription && !detail.isSupplyProduct ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {detail.heroDescription}
        </p>
      ) : null}

      {showPreparationTypeSelector && onPreparationTypeChange ? (
        <ProductDetailPreparationTypeSelector
          product={product}
          value={preparationType}
          onChange={onPreparationTypeChange}
        />
      ) : null}

      {(() => {
        const showTonerSelector =
          tonerCards.length > 0 && selectedTonerOptionIds != null && onTonerToggle != null;
        const showTonerOriginalRicoh =
          detail.isPrinterEquipment && /ricoh/i.test(brandLabel ?? detail.brandLabel);

        if (!showTonerSelector && !showTonerOriginalRicoh) return null;

        return showTonerSelector ? (
          <ProductDetailHeroTonerSelector
            cards={tonerCards}
            selectedOptionIds={selectedTonerOptionIds}
            onToggle={onTonerToggle}
            className="mt-4"
          />
        ) : (
          <p className="mt-4 text-sm font-semibold leading-snug text-[#0f1f3d]">Toner Original RICOH</p>
        );
      })()}

      {afterTonerSlot}
    </div>
  );
}
