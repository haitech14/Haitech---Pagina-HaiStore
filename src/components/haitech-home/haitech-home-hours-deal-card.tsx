import { useState } from 'react';
import { Link } from 'react-router-dom';

import { ProductQuantityAddFooter } from '@/components/product/product-quantity-add-footer';
import { ProductCardSplitBrandTitle } from '@/components/product/product-card-title';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { useCompanySettings } from '@/hooks/use-company-settings';
import {
  formatHaitechPen,
  HAITECH_SHOP,
  type HaitechShopProduct,
} from '@/data/haitech-home-shop';
import { getDisplayPriceVisibility } from '@/lib/display-price';
import { roundEquipmentDisplayUsd } from '@/lib/pen-pricing';
import { cn, penToUsd } from '@/lib/utils';
import type { Product } from '@/types/product';

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

function formatUsd(usd: number): string {
  const normalized = Math.round(usd * 100) / 100;
  const isWhole = Math.abs(normalized % 1) < 0.001;
  return `US$ ${normalized.toLocaleString('en-US', {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: isWhole ? 0 : 2,
  })}`;
}

function resolveCardTitle(product: HaitechShopProduct): string {
  const typeLabel = product.productTypeLabel ?? 'Impresora Multifuncional';
  const model = product.featuredTitle ?? product.name.replace(/\bMultifuncional\b/i, '').trim();
  const combined = `${typeLabel} ${model}`.replace(/\s+/g, ' ').trim();
  return combined;
}

export function HaitechHomeHoursDealCard({ product }: { product: HaitechShopProduct }) {
  const { data: companySettings } = useCompanySettings();
  const { displayCurrency, dualPriceOrder } = useDisplayCurrency();
  const { showUsd, showPen } = getDisplayPriceVisibility(displayCurrency);
  const saleRate = companySettings?.usdToPenExchangeRate;
  const [imgError, setImgError] = useState(false);

  const cartProduct = toCartProduct(product, saleRate);
  const title = resolveCardTitle(product);
  const rawUsd = penToUsd(product.price, saleRate);
  const priceUsd = product.toner ? rawUsd : roundEquipmentDisplayUsd(rawUsd);
  const compareUsd =
    product.compareAt != null
      ? product.toner
        ? penToUsd(product.compareAt, saleRate)
        : roundEquipmentDisplayUsd(penToUsd(product.compareAt, saleRate))
      : null;
  const penFirst = dualPriceOrder === 'pen-usd';
  const showCompare = product.compareAt != null && product.compareAt > product.price;
  const compareLabel = showCompare
    ? showPen && !showUsd
      ? formatHaitechPen(product.compareAt!)
      : showUsd && !showPen && compareUsd != null
        ? formatUsd(compareUsd)
        : formatHaitechPen(product.compareAt!)
    : null;

  const body = (
    <>
      <div className="mt-1.5 flex h-[112px] w-full items-center justify-center sm:h-[132px]">
        {imgError ? (
          <div className="flex size-full items-center justify-center rounded-lg bg-[#F0F0F0] text-sm font-bold text-[#999]">
            {title.slice(0, 1)}
          </div>
        ) : (
          <img
            src={product.image}
            alt=""
            className="max-h-full max-w-full object-contain"
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
        )}
      </div>

      <h3
        className="mt-1.5 text-pretty break-words text-center text-[0.75rem] font-bold leading-snug text-[#111111] sm:text-sm"
        title={title}
      >
        <ProductCardSplitBrandTitle title={title} brand={product.brand ?? 'RICOH'} />
      </h3>

      <div className="mt-1.5 flex flex-col items-center leading-none text-center">
        {showCompare || product.discountLabel ? (
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {compareLabel ? (
              <span className="text-[0.75rem] font-normal tabular-nums text-[#9aa3b2] line-through decoration-[#9aa3b2] sm:text-[0.8125rem]">
                {compareLabel}
              </span>
            ) : null}
            {product.discountLabel ? (
              <span
                className="inline-flex rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white"
                style={{ backgroundColor: HAITECH_SHOP.brand }}
              >
                {product.discountLabel}
              </span>
            ) : null}
          </div>
        ) : null}

        {(displayCurrency === 'USD' && priceUsd > 0) ||
        (displayCurrency === 'BOTH' && !penFirst && priceUsd > 0) ? (
          <p className="mt-0.5 text-sm font-semibold tabular-nums leading-none text-[#E30613] sm:text-[0.9375rem]">
            {formatUsd(priceUsd)}
          </p>
        ) : (
          <p className="mt-0.5 text-sm font-semibold tabular-nums leading-none text-[#E30613] sm:text-[0.9375rem]">
            {formatHaitechPen(product.price)}
          </p>
        )}

        {displayCurrency === 'BOTH' && priceUsd > 0 ? (
          <p className="mt-0 text-[11px] font-medium leading-none tabular-nums text-[#6B7280] sm:text-xs">
            {penFirst ? formatUsd(priceUsd) : formatHaitechPen(product.price)}
          </p>
        ) : null}
      </div>
    </>
  );

  return (
    <article className="group group/card flex h-full flex-col rounded-xl border border-[#E8E8E8] bg-white p-2.5 shadow-[0_4px_18px_rgba(15,31,61,0.08)] sm:p-3">
      {product.href ? (
        <Link
          to={product.href}
          className="flex flex-col outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/40"
        >
          {body}
        </Link>
      ) : (
        <div className="flex flex-col">{body}</div>
      )}

      <div className="mt-2 flex w-full justify-center">
        <ProductQuantityAddFooter
          product={cartProduct}
          size="sm"
          addLabel="Agregar al carrito"
          revealQuantityOnHover
          centeredActions
          quantityClassName="h-8 rounded-lg sm:h-9"
          addButtonClassName={cn(
            'h-8 min-h-8 w-auto min-w-0 flex-none justify-center rounded-lg px-3.5 text-[0.6875rem] font-semibold shadow-none sm:h-9 sm:min-h-9 md:text-sm',
            'border-[#E30613] bg-[#E30613] hover:border-[#c90511] hover:bg-[#c90511]',
          )}
        />
      </div>
    </article>
  );
}
