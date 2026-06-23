import { Star } from 'lucide-react';

import { ProductDetailHeroActions } from '@/components/product-detail/product-detail-hero-actions';
import { ProductDetailHeroTonerSelector } from '@/components/product-detail/product-detail-hero-toner-selector';
import { isProductOutOfStock } from '@/components/cart/add-to-cart-button';
import type { ConfigureTonerCard } from '@/lib/product-configure-toner';
import { resolveHeroBulletIcon } from '@/lib/product-storefront-detail';
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
}: ProductDetailHeroInfoProps) {
  const outOfStock = isProductOutOfStock(product);
  const stockDisplay = outOfStock ? 0 : product.stock;
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
      {detail.brandLabel ? (
        <p className="text-xs font-bold uppercase tracking-wider text-primary">
          {detail.brandLabel}
        </p>
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

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        {outOfStock ? (
          <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            Sin stock
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            En stock
          </span>
        )}
        <p className="text-muted-foreground">
          Código: <span className="font-medium text-foreground">{detail.sku}</span>
          {!outOfStock && stockDisplay > 0 ? (
            <span className="sr-only">, {stockDisplay} unidades disponibles</span>
          ) : null}
        </p>
      </div>

      {(() => {
        const regaloIndex = detail.heroSpecBullets.findIndex(isRegaloBullet);
        const bulletsBefore =
          regaloIndex >= 0
            ? detail.heroSpecBullets.slice(0, regaloIndex + 1)
            : detail.heroSpecBullets;
        const bulletsAfter = regaloIndex >= 0 ? detail.heroSpecBullets.slice(regaloIndex + 1) : [];
        const showTonerSelector =
          tonerCards.length > 0 && selectedTonerOptionIds != null && onTonerToggle != null;

        return (
          <>
            {renderSpecBullets(bulletsBefore)}
            {showTonerSelector ? (
              <ProductDetailHeroTonerSelector
                cards={tonerCards}
                selectedOptionIds={selectedTonerOptionIds}
                onToggle={onTonerToggle}
              />
            ) : null}
            {renderSpecBullets(bulletsAfter)}
          </>
        );
      })()}

      {detail.heroLead ? (
        <p className="mt-3 text-sm font-semibold leading-snug text-[#0f1f3d] sm:text-base">
          {detail.heroLead}
        </p>
      ) : null}

      {detail.heroDescription ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {detail.heroDescription}
        </p>
      ) : null}

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
