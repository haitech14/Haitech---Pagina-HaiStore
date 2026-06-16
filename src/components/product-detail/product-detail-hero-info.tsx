import { useState } from 'react';
import { Headphones, Minus, Plus, Shield, ShoppingCart, Truck } from 'lucide-react';

import { AddToCartButton, getAddToCartLabel } from '@/components/cart/add-to-cart-button';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { ProductDetailHeroActions } from '@/components/product-detail/product-detail-hero-actions';
import { ProductDetailPriceBlock } from '@/components/product-detail/product-detail-price-block';
import { cn } from '@/lib/utils';
import type { ProductDetailViewModel } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductDetailHeroInfoProps {
  product: Product;
  detail: ProductDetailViewModel;
  onQuoteClick: () => void;
}

function ProductDetailStockBadge({ product }: { product: Product }) {
  const outOfStock = product.stock <= 0;
  const stockDisplay = outOfStock ? 0 : product.stock;

  return (
    <p
      className={cn(
        'flex items-center gap-1.5 font-medium',
        outOfStock ? 'text-red-600' : 'text-[#0f1f3d]',
      )}
    >
      <span
        className={cn(
          'flex size-5 items-center justify-center rounded-full text-[0.65rem] font-bold',
          outOfStock ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600',
        )}
        aria-hidden="true"
      >
        {outOfStock ? '!' : '✓'}
      </span>
      {outOfStock ? 'Sin stock' : `${stockDisplay} en stock`}
    </p>
  );
}

export function ProductDetailHeroInfo({
  product,
  detail,
  onQuoteClick,
}: ProductDetailHeroInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const productCode = detail.sku;
  const outOfStock = product.stock <= 0;
  const stockMax = outOfStock ? 1 : Math.max(product.stock, 1);
  const showNuevoBadge = detail.tagPills.includes('Nuevo');

  const adjustQuantity = (delta: number) => {
    setQuantity((current) => Math.max(1, Math.min(stockMax, current + delta)));
  };

  return (
    <div className="flex min-w-0 flex-col">
      {showNuevoBadge ? (
        <span className="mb-1.5 inline-flex w-fit rounded bg-red-600 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white sm:text-xs">
          Nuevo
        </span>
      ) : null}

      <h1 className="text-balance text-xl font-bold leading-tight text-[#0f1f3d] sm:text-2xl lg:text-[1.65rem]">
        {detail.heroTitle ?? product.name}
      </h1>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm">
        <p className="text-muted-foreground">
          Código:{' '}
          <span className="font-semibold text-[#0f1f3d]">{productCode}</span>
        </p>
        <span className="text-muted-foreground/50" aria-hidden="true">
          ·
        </span>
        <ProductDetailStockBadge product={product} />
      </div>

      {detail.bullets.length > 0 ? (
        <ul className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2">
          {detail.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2 text-xs text-[#0f1f3d] sm:text-sm">
              <span
                className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-red-600 text-[0.6rem] font-bold text-white"
                aria-hidden="true"
              >
                ✓
              </span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-3 sm:mt-4">
        <ProductDetailPriceBlock product={product} detail={detail} className="px-0 py-0" />
      </div>

      <div className="mt-4 flex flex-col gap-2.5 sm:mt-5">
        <div className="flex gap-2.5">
          <div
            className="flex shrink-0 items-center rounded-lg border border-border bg-background"
            aria-label="Cantidad"
          >
            <button
              type="button"
              onClick={() => adjustQuantity(-1)}
              disabled={quantity <= 1 || outOfStock}
              aria-label="Disminuir cantidad"
              className="flex size-11 min-h-11 items-center justify-center text-muted-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>
            <span
              className="flex min-w-10 items-center justify-center px-2 text-base font-semibold text-[#0f1f3d] sm:min-w-12"
              aria-live="polite"
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => adjustQuantity(1)}
              disabled={quantity >= stockMax || outOfStock}
              aria-label="Aumentar cantidad"
              className="flex size-11 min-h-11 items-center justify-center text-muted-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>

          <AddToCartButton
            product={product}
            addOptions={{ quantity }}
            size="lg"
            disabled={outOfStock}
            className="min-h-11 flex-1 rounded-lg bg-red-600 text-sm font-semibold text-white hover:bg-red-500 focus-visible:ring-red-600 sm:text-base"
          >
            <ShoppingCart className="size-4" aria-hidden="true" />
            {getAddToCartLabel(product, 'detail')}
          </AddToCartButton>
        </div>

        <ProductDetailHeroActions
          onQuoteClick={onQuoteClick}
          technicalSheetUrl={detail.technicalSheetUrl}
          fullWidth
        />

        <AddToCartButton
          product={product}
          addOptions={{ quantity }}
          size="lg"
          variant="outline"
          disabled={outOfStock}
          className="h-11 w-full rounded-lg border-[#0f1f3d]/30 bg-background text-sm font-semibold text-[#0f1f3d] hover:bg-muted/40 focus-visible:ring-[#0f1f3d] sm:text-base"
        >
          Comprar Ahora
        </AddToCartButton>

        <ProductWhatsAppButton
          stopPropagation={false}
          label="Comprar Ahora Whatsapp"
          quantity={quantity}
          className="h-11 w-full gap-2 px-4 text-sm font-semibold sm:text-base"
          product={{
            id: product.id,
            name: product.name,
            priceUsd: product.price,
            category: product.category,
            brand: product.brand ?? null,
          }}
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:mt-4 sm:grid-cols-3 sm:gap-2.5">
        <div className="rounded-lg border border-border/70 bg-background px-3 py-2.5 text-center sm:py-3">
          <Truck className="mx-auto size-5 text-red-600" aria-hidden="true" />
          <p className="mt-1 text-[0.65rem] font-semibold text-[#0f1f3d] sm:text-xs">Envío</p>
          <p className="text-[0.6rem] leading-snug text-muted-foreground sm:text-[0.65rem]">
            Entrega en 3-5 días hábiles
          </p>
        </div>
        <div className="rounded-lg border border-border/70 bg-background px-3 py-2.5 text-center sm:py-3">
          <Shield className="mx-auto size-5 text-red-600" aria-hidden="true" />
          <p className="mt-1 text-[0.65rem] font-semibold text-[#0f1f3d] sm:text-xs">Garantía</p>
          <p className="text-[0.6rem] leading-snug text-muted-foreground sm:text-[0.65rem]">
            1 año de garantía oficial
          </p>
        </div>
        <div className="rounded-lg border border-border/70 bg-background px-3 py-2.5 text-center sm:py-3">
          <Headphones className="mx-auto size-5 text-red-600" aria-hidden="true" />
          <p className="mt-1 text-[0.65rem] font-semibold text-[#0f1f3d] sm:text-xs">Soporte</p>
          <p className="text-[0.6rem] leading-snug text-muted-foreground sm:text-[0.65rem]">
            Soporte técnico especializado
          </p>
        </div>
      </div>
    </div>
  );
}
