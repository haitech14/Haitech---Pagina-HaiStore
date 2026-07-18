import { useEffect, useId, useState } from 'react';
import {
  Minus,
  Plus,
  ShoppingCart,
  Store,
  Truck,
  Zap,
} from 'lucide-react';

import {
  AddToCartButton,
  ON_REQUEST_STOCK_BADGE_CLASS,
  adjustProductQuantity,
  formatOrderQuantityHint,
  getAddToCartLabel,
  hasOnRequestQuantity,
  isProductOutOfStock,
} from '@/components/cart/add-to-cart-button';
import { DualPrice } from '@/components/product/product-dual-price';
import { ProductWhatsAppButton } from '@/components/product-whatsapp-button';
import { Button } from '@/components/ui/button';
import { ProductDetailPriceBlock } from '@/components/product-detail/product-detail-price-block';
import { ProductDetailPurchaseAccordion } from '@/components/product-detail/product-detail-purchase-accordion';
import type { ProductDetailViewModel } from '@/types/product-detail';
import type { Product } from '@/types/product';
import { PRODUCT_ON_REQUEST_STOCK_DETAIL_LABEL } from '@/lib/product-on-request-label';
import { cn } from '@/lib/utils';

interface ProductDetailPurchaseBoxProps {
  product: Product;
  detail: ProductDetailViewModel;
}

function useOrderCountdown() {
  const [remaining, setRemaining] = useState({ hours: 20, minutes: 43, seconds: 32 });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds -= 1;
        if (seconds < 0) {
          seconds = 59;
          minutes -= 1;
        }
        if (minutes < 0) {
          minutes = 59;
          hours -= 1;
        }
        if (hours < 0) {
          return { hours: 23, minutes: 59, seconds: 59 };
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(remaining.hours)}h : ${pad(remaining.minutes)}m : ${pad(remaining.seconds)}s`;
}

export function ProductDetailPurchaseBox({ product, detail }: ProductDetailPurchaseBoxProps) {
  const [quantity, setQuantity] = useState(1);
  const [volumeExpanded, setVolumeExpanded] = useState(false);
  const [warrantyExpanded, setWarrantyExpanded] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState(
    detail.warrantyOptions[0]?.id ?? 'none',
  );
  const volumePanelId = useId();
  const warrantyPanelId = useId();
  const outOfStock = isProductOutOfStock(product);
  const countdown = useOrderCountdown();
  const stockDisplay = outOfStock ? 0 : Math.max(0, Math.floor(Number(product.stock) || 0));
  const includesOnRequest = hasOnRequestQuantity(product, quantity);
  const orderHint = formatOrderQuantityHint(product, quantity);

  const adjustQuantity = (delta: number) => {
    setQuantity((current) => adjustProductQuantity(product, current, delta));
  };

  return (
    <aside
      className="rounded-xl bg-neutral-100 p-4 lg:sticky lg:top-24 lg:self-start"
      aria-labelledby="compra-titulo"
    >
      <h2 id="compra-titulo" className="sr-only">
        Comprar {product.name}
      </h2>

      <ProductDetailPriceBlock product={product} detail={detail} />

      <p
        className={cn(
          'flex items-center gap-1.5 text-sm font-semibold',
          !outOfStock && 'text-red-600',
        )}
      >
        <span
          className={cn(
            'flex size-5 items-center justify-center rounded-full',
            outOfStock
              ? 'border border-amber-400 bg-amber-100 text-amber-950'
              : 'bg-red-100 text-red-600',
          )}
          aria-hidden="true"
        >
          ✓
        </span>
        <span className={outOfStock ? ON_REQUEST_STOCK_BADGE_CLASS : undefined}>
          {outOfStock ? PRODUCT_ON_REQUEST_STOCK_DETAIL_LABEL : `${stockDisplay} disponibles`}
        </span>
      </p>

      <div className="mt-4 flex items-center rounded-lg border border-neutral-200 bg-white">
        <button
          type="button"
          onClick={() => adjustQuantity(-1)}
          disabled={quantity <= 1}
          aria-label="Disminuir cantidad"
          className="flex size-11 items-center justify-center text-neutral-600 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-40"
        >
          <Minus className="size-4" aria-hidden="true" />
        </button>
        <span
          className="flex-1 text-center text-base font-semibold text-neutral-900"
          aria-live="polite"
          title={orderHint ?? undefined}
        >
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => adjustQuantity(1)}
          aria-label="Aumentar cantidad"
          className="flex size-11 items-center justify-center text-neutral-600 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-40"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>

      {includesOnRequest && orderHint ? (
        <p className="mt-2 text-center text-xs text-muted-foreground">{orderHint}</p>
      ) : null}

      <div className="mt-4 space-y-2">
        {detail.bulkDiscountTiers.length > 0 && (
          <ProductDetailPurchaseAccordion
            title="Precio por volumen"
            subtitle="Desplegar tramos y precio por unidad"
            expanded={volumeExpanded}
            onToggle={() => setVolumeExpanded((value) => !value)}
            panelId={volumePanelId}
          >
            <ul className="space-y-2">
              {detail.bulkDiscountTiers.map((tier) => {
                const tierUnitUsd =
                  Math.round(product.price * (1 - tier.discountPercent / 100) * 100) / 100;

                return (
                  <li
                    key={tier.range}
                    className="flex items-center justify-between gap-3 rounded-lg bg-neutral-50 px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-neutral-900">{tier.range}</p>
                      <p className="text-xs text-red-600">{tier.discount}</p>
                    </div>
                    <p className="shrink-0 text-right">
                      <span className="block text-xs text-neutral-500">Precio/unidad</span>
                      <DualPrice usd={tierUnitUsd} className="font-bold text-neutral-900" />
                    </p>
                  </li>
                );
              })}
            </ul>
            <Button
              type="button"
              variant="outline"
              className="mt-3 h-9 w-full rounded-lg border-red-600 text-xs font-semibold text-red-600 hover:bg-red-50 focus-visible:ring-red-600"
            >
              Solicitar cotización mayorista
            </Button>
          </ProductDetailPurchaseAccordion>
        )}

        {detail.warrantyOptions.length > 0 && (
          <ProductDetailPurchaseAccordion
            title="Garantía extendida"
            subtitle="Desplegar opciones y precio adicional"
            expanded={warrantyExpanded}
            onToggle={() => setWarrantyExpanded((value) => !value)}
            panelId={warrantyPanelId}
          >
            <fieldset>
              <legend className="sr-only">Seleccionar garantía extendida</legend>
              <ul className="space-y-2">
                {detail.warrantyOptions.map((option) => {
                  const inputId = `warranty-${option.id}`;

                  return (
                    <li key={option.id}>
                      <label
                        htmlFor={inputId}
                        className={cn(
                          'flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                          selectedWarranty === option.id
                            ? 'border-red-600 bg-red-50'
                            : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300',
                        )}
                      >
                        <span className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            id={inputId}
                            name="warranty-option"
                            value={option.id}
                            checked={selectedWarranty === option.id}
                            onChange={() => setSelectedWarranty(option.id)}
                            className="size-4 accent-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                          />
                          <span className="font-medium text-neutral-900">{option.label}</span>
                        </span>
                        {option.priceUsd != null ? (
                          <span className="shrink-0 font-semibold text-neutral-900">
                            +{' '}
                            <DualPrice usd={option.priceUsd} className="inline font-semibold" />
                          </span>
                        ) : (
                          <span className="shrink-0 text-xs text-neutral-500">Sin costo</span>
                        )}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          </ProductDetailPurchaseAccordion>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <div className="flex gap-2">
          <AddToCartButton
            product={product}
            addOptions={{ quantity }}
            size="lg"
            className="h-11 min-h-11 flex-1 rounded-lg bg-red-600 text-sm font-semibold text-white hover:bg-red-500 focus-visible:ring-red-600"
          >
            <ShoppingCart className="size-4" aria-hidden="true" />
            {getAddToCartLabel(product, 'detail')}
          </AddToCartButton>
          <ProductWhatsAppButton
            className="size-11"
            stopPropagation={false}
            product={{
              id: product.id,
              name: product.name,
              priceUsd: product.price,
              category: product.category,
              brand: product.brand ?? null,
            }}
          />
        </div>
        <AddToCartButton
          product={product}
          addOptions={{ quantity }}
          size="lg"
          variant="outline"
          className="h-11 w-full rounded-lg border-red-200 bg-white text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:ring-red-600 hover:text-red-700"
        >
          Comprar ahora
        </AddToCartButton>
      </div>

      <div className="mt-5 rounded-lg bg-neutral-200 px-3 py-4 sm:px-4">
        <ul className="space-y-3 text-sm">
          <li className="flex gap-3">
            <Truck className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-neutral-900">Llega mañana</p>
              <p className="text-xs text-neutral-600">si ordenas en las próximas {countdown}</p>
            </div>
          </li>

          <li className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <Truck className="mt-0.5 size-4 shrink-0 text-neutral-500" aria-hidden="true" />
              <div>
                <p className="font-medium text-neutral-900">Envío Regular</p>
                <p className="text-xs text-neutral-600">Entrega en 3-5 días hábiles</p>
              </div>
            </div>
            <span className="shrink-0 rounded bg-white px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-neutral-700">
              OLVA
            </span>
          </li>

          <li className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <Zap className="mt-0.5 size-4 shrink-0 text-neutral-500" aria-hidden="true" />
              <div>
                <p className="font-medium text-neutral-900">Envío Express</p>
                <p className="text-xs text-neutral-600">Entrega en 24-48 horas</p>
              </div>
            </div>
            <span className="shrink-0 rounded bg-orange-50 px-2 py-0.5 text-[0.65rem] font-bold text-orange-600">
              soydelivery
            </span>
          </li>

          <li className="flex gap-3">
            <Store className="mt-0.5 size-4 shrink-0 text-neutral-500" aria-hidden="true" />
            <div>
              <p className="font-medium text-neutral-900">Retiro en tienda</p>
              <p className="text-xs text-neutral-600">Lun - Vie: 9:00 am - 6:00 pm</p>
            </div>
          </li>
        </ul>
      </div>

      <div className="mt-4 pt-4">
        <p className="mb-2 text-xs font-medium text-neutral-500">Medios de pago</p>
        <img
          src="/mediosdepago2.png"
          alt="Medios de pago aceptados: Visa, Mastercard, American Express, Yape, Plin, Diners Club y PagoEfectivo"
          className="block h-auto w-full max-w-full object-contain"
          loading="lazy"
          width={1200}
          height={96}
        />
      </div>
    </aside>
  );
}
