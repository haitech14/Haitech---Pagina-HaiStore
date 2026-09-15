import {
  useEffect,
  useState,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { Check, Package, ShoppingCart } from 'lucide-react';

import type { ProductCardHoverFeature } from '@/lib/product-card-hover-features';
import { cn } from '@/lib/utils';

/** Elevación, sombra y radio premium (20px / 300ms ease). */
export const PRODUCT_CARD_PREMIUM_SHELL_CLASS = cn(
  'rounded-[20px] transition-[transform,box-shadow] duration-300 ease-out will-change-transform',
  'hover:-translate-y-[6px] hover:z-20 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]',
  'focus-within:-translate-y-[6px] focus-within:z-20 focus-within:shadow-[0_18px_40px_rgba(15,23,42,0.12)]',
  'data-[expanded=true]:-translate-y-[6px] data-[expanded=true]:z-20',
  'data-[expanded=true]:shadow-[0_18px_40px_rgba(15,23,42,0.12)]',
  'motion-reduce:transform-none motion-reduce:transition-none',
);

export const PRODUCT_CARD_PREMIUM_ADD_BUTTON_CLASS = cn(
  'origin-center transition-transform duration-300 ease-out',
  'group-hover:scale-105 group-focus-within:scale-105',
  'group-data-[expanded=true]:scale-105',
  'motion-reduce:transform-none',
);

const HOVER_REVEAL_CLASS = cn(
  'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity,margin] duration-300 ease-out',
  'group-hover:mt-2 group-hover:grid-rows-[1fr] group-hover:opacity-100',
  'group-focus-within:mt-2 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100',
  'group-data-[expanded=true]:mt-2 group-data-[expanded=true]:grid-rows-[1fr] group-data-[expanded=true]:opacity-100',
  'motion-reduce:mt-2 motion-reduce:grid-rows-[1fr] motion-reduce:opacity-100 motion-reduce:transition-none',
);

const FINE_HOVER_MQ = '(hover: hover) and (pointer: fine)';

export function useProductCardHoverReveal() {
  const [expanded, setExpanded] = useState(false);
  const [hoverCapable, setHoverCapable] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia(FINE_HOVER_MQ);
    const sync = () => {
      setHoverCapable(mediaQuery.matches);
      if (mediaQuery.matches) setExpanded(false);
    };
    sync();
    mediaQuery.addEventListener('change', sync);
    return () => mediaQuery.removeEventListener('change', sync);
  }, []);

  const toggleExpanded = (event?: MouseEvent | PointerEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    setExpanded((current) => !current);
  };

  const onCardPointerUp = (event: PointerEvent<HTMLElement>) => {
    if (hoverCapable) return;
    if (event.pointerType === 'mouse') return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('a, button, input, [role="button"]')) return;
    setExpanded((current) => !current);
  };

  return {
    expanded,
    hoverCapable,
    toggleExpanded,
    cardProps: {
      'data-expanded': expanded ? true : undefined,
      onPointerUp: onCardPointerUp,
    } as const,
  };
}

/** Estado compacto siempre visible: marca, título y precio. */
export function ProductCardDefault({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('flex min-h-0 flex-1 flex-col', className)}>{children}</div>;
}

export function ProductCardHover({
  features,
  productName,
  stock,
  outOfStock = false,
  onAddToCart,
  addLabel = 'Agregar al carrito',
}: {
  features: ProductCardHoverFeature[];
  detailHref?: string;
  productName: string;
  stock?: number;
  outOfStock?: boolean;
  onAddToCart?: () => void;
  addLabel?: string;
}) {
  const showStock = stock != null;
  const inStock = showStock && !outOfStock && stock > 0;

  return (
    <div className={HOVER_REVEAL_CLASS} data-product-card-hover="">
      <div className="min-h-0 overflow-hidden">
        <div
          className={cn(
            'translate-y-2 rounded-[14px] bg-white px-2.5 py-2.5',
            'shadow-[inset_0_1px_0_rgba(15,23,42,0.04),0_8px_20px_rgba(15,23,42,0.06)]',
            'transition-transform duration-300 ease-out',
            'group-hover:translate-y-0 group-focus-within:translate-y-0',
            'group-data-[expanded=true]:translate-y-0',
            'motion-reduce:translate-y-0',
          )}
        >
          {features.length > 0 ? (
            <ul className="space-y-1" aria-label="Características principales">
              {features.map((feature) => (
                <li
                  key={feature.id}
                  className="flex items-start gap-1.5 text-[11px] leading-snug text-[#374151] sm:text-xs"
                >
                  <Check
                    className="mt-0.5 size-3.5 shrink-0 text-emerald-600"
                    strokeWidth={2.4}
                    aria-hidden="true"
                  />
                  <span>
                    <span className="font-medium text-[#6B7280]">{feature.label}: </span>
                    <span className="font-semibold text-[#111111]">{feature.value}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {showStock ? (
            <p
              className={cn(
                'mt-2 inline-flex items-center gap-1 text-[11px] font-semibold sm:text-xs',
                inStock ? 'text-emerald-700' : 'text-[#6B7280]',
              )}
            >
              {inStock ? (
                <Package className="size-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
              ) : null}
              <span>{inStock ? `Stock ${stock}` : 'Entrega a pedido'}</span>
            </p>
          ) : null}

          {onAddToCart ? (
            <div className={cn('flex flex-col gap-2', (features.length > 0 || showStock) && 'mt-2.5')}>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onAddToCart();
                }}
                className={cn(
                  'inline-flex h-9 min-h-9 items-center justify-center gap-1.5 rounded-lg bg-[#E30613] px-3',
                  'text-[12px] font-semibold text-white transition-[transform,background-color] duration-300 ease-out',
                  'hover:bg-[#c90511] hover:scale-105 focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
                  PRODUCT_CARD_PREMIUM_ADD_BUTTON_CLASS,
                )}
                aria-label={`${addLabel}: ${productName}`}
              >
                <ShoppingCart className="size-3.5 shrink-0" aria-hidden="true" />
                {addLabel}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ProductCardHoverToggle({
  expanded,
  productName,
  onToggle,
}: {
  expanded: boolean;
  productName: string;
  onToggle: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        'mt-1.5 inline-flex w-fit text-[11px] font-semibold text-[#E30613]',
        'underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
        '[@media(hover:hover)_and_(pointer:fine)]:hidden',
      )}
      aria-expanded={expanded}
      aria-label={
        expanded
          ? `Ocultar características de ${productName}`
          : `Ver características de ${productName}`
      }
      onClick={onToggle}
    >
      {expanded ? 'Ocultar características' : 'Ver características'}
    </button>
  );
}
