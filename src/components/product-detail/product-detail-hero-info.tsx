import { Star } from 'lucide-react';
import type { ReactNode } from 'react';

import { ProductDetailHeroActions } from '@/components/product-detail/product-detail-hero-actions';
import { ProductDetailHeroTonerSelector } from '@/components/product-detail/product-detail-hero-toner-selector';
import { ProductDetailPreparationTypeSelector } from '@/components/product-detail/product-detail-preparation-type-selector';
import { ProductConditionBadge } from '@/components/product/product-condition-badge';
import { isProductOutOfStock } from '@/components/cart/add-to-cart-button';
import type { ConfigureTonerCard } from '@/lib/product-configure-toner';
import {
  resolveProductEquipmentConditionLabel,
  resolveProductHeroBrand,
  resolveProductHeroCode,
  resolveProductStockAvailability,
} from '@/lib/product-hero-meta';
import { resolveHeroBulletIcon } from '@/lib/product-storefront-detail';
import type { SeminuevaPreparationType } from '@/lib/seminueva-preparation';
import { cn } from '@/lib/utils';
import type { ProductDetailViewModel, ProductHeroSpecBullet } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductDetailHeroInfoProps {
  product: Product;
  detail: ProductDetailViewModel;
  onCompareClick?: () => void;
  onQuoteClick?: () => void;
  showCompareAction?: boolean;
  tonerCards?: ConfigureTonerCard[];
  selectedTonerOptionIds?: Set<string>;
  onTonerToggle?: (card: ConfigureTonerCard) => void;
  showPreparationTypeSelector?: boolean;
  preparationType?: SeminuevaPreparationType;
  onPreparationTypeChange?: (value: SeminuevaPreparationType) => void;
  afterTonerSlot?: ReactNode;
}

function isRegaloBullet(bullet: ProductHeroSpecBullet): boolean {
  const haystack = `${bullet.text ?? ''} ${bullet.label ?? ''}`.toLowerCase();
  return haystack.includes('regalo');
}

export function ProductDetailHeroInfo({
  product,
  detail,
  onCompareClick,
  onQuoteClick,
  showCompareAction = false,
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
  const productCode = resolveProductHeroCode(product) ?? detail.sku;
  const stockAvailability = resolveProductStockAvailability(product, outOfStock);
  const conditionLabel = resolveProductEquipmentConditionLabel(product);
  const displayRating = Number(detail.rating.toFixed(1));
  const fullStars = Math.min(5, Math.max(0, Math.round(displayRating)));
  const renderSpecBullets = (bullets: typeof detail.heroSpecBullets) => {
    if (bullets.length === 0) return null;

    return (
      <ul className="mt-3 flex flex-col gap-2 text-sm leading-snug text-[#0f1f3d]">
        {bullets.map((bullet) => {
          const key =
            bullet.parts?.map((part) => part.label).join('-') ??
            bullet.label ??
            bullet.text ??
            'spec';
          const IconComponent = resolveHeroBulletIcon(bullet);
          if (bullet.parts?.length) {
            return (
              <li key={key} className="flex items-start gap-2">
                <IconComponent
                  className="mt-0.5 size-4 shrink-0 text-red-600"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span className="flex flex-col gap-1">
                  {bullet.parts.map((part) => (
                    <span key={part.label}>
                      <span className="font-semibold">{part.label}:</span> {part.value}
                    </span>
                  ))}
                </span>
              </li>
            );
          }
          if (bullet.label && bullet.value) {
            return (
              <li key={key} className="flex items-start gap-2">
                <IconComponent
                  className="mt-0.5 size-4 shrink-0 text-red-600"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span>
                  <span className="font-semibold">{bullet.label}:</span> {bullet.value}
                </span>
              </li>
            );
          }
          return (
            <li key={key} className="flex items-start gap-2">
              <IconComponent
                className="mt-0.5 size-4 shrink-0 text-red-600"
                strokeWidth={2}
                aria-hidden="true"
              />
              <span>{bullet.text}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="flex min-w-0 flex-col">
      {brandLabel || conditionLabel ? (
        <div className="flex w-full items-center gap-2">
          {brandLabel ? (
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              {brandLabel}
            </p>
          ) : null}
          {conditionLabel ? (
            <ProductConditionBadge label={conditionLabel} className="ml-auto" />
          ) : null}
        </div>
      ) : null}

      <h1 className="mt-1 text-pretty text-xl font-bold leading-snug text-[#0f1f3d] sm:text-2xl lg:text-[1.65rem] lg:leading-tight">
        {detail.heroTitle ?? product.name}
      </h1>

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

      <div className="mt-2 flex w-full items-center gap-2 text-xs sm:text-sm">
        {productCode ? (
          <p className="text-muted-foreground">
            Código: <span className="font-medium font-mono text-foreground">{productCode}</span>
          </p>
        ) : null}
        <span
          className={cn(
            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
            stockAvailability.tone === 'unavailable' &&
              'border border-amber-400 bg-amber-100 text-amber-950',
            stockAvailability.tone === 'low' && 'bg-amber-50 text-amber-800',
            stockAvailability.tone === 'available' && 'bg-emerald-50 text-emerald-700',
          )}
        >
          {stockAvailability.label}
        </span>
      </div>

      {(() => {
        const regaloIndex = detail.heroSpecBullets.findIndex(isRegaloBullet);
        const bulletsBefore =
          regaloIndex >= 0
            ? detail.heroSpecBullets.slice(0, regaloIndex + 1)
            : detail.heroSpecBullets;
        const bulletsAfter = regaloIndex >= 0 ? detail.heroSpecBullets.slice(regaloIndex + 1) : [];

        return (
          <>
            {renderSpecBullets(bulletsBefore)}
            {renderSpecBullets(bulletsAfter)}
          </>
        );
      })()}

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

      <ProductDetailHeroActions
        technicalSheetUrl={detail.technicalSheetUrl}
        technicalSheetFileName={detail.technicalSheetFileName}
        technicalSheetMimeType={detail.technicalSheetMimeType}
        {...(showCompareAction && onCompareClick ? { onCompareClick } : {})}
        {...(onQuoteClick ? { onQuoteClick } : {})}
        className="mt-4"
        fullWidth
      />
    </div>
  );
}
