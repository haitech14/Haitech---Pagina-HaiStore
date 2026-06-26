import { useEffect, useId, useState } from 'react';
import { ChevronDown, Shield, Zap } from 'lucide-react';

import { CheckoutCartLinePricing } from '@/components/checkout/checkout-cart-line-pricing';
import { CheckoutCartLineQuantity } from '@/components/checkout/checkout-cart-line-quantity';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cartLineUnitUsd, useCart } from '@/context/cart-context';
import { isMultifuncionalCartProduct } from '@/lib/checkout-cart-product';
import {
  buildCheckoutAddonLineId,
  CHECKOUT_ADDON_KINDS,
  CHECKOUT_ADDON_LABELS,
  resolveCheckoutMultifuncionalAddonProduct,
  type CheckoutMultifuncionalAddonKind,
} from '@/lib/checkout-multifuncional-addons';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { cn } from '@/lib/utils';
import type { CartItem } from '@/types/product';

const ADDON_ICONS: Record<CheckoutMultifuncionalAddonKind, typeof Zap> = {
  estabilizador: Zap,
  'garantia-extendida': Shield,
};

interface CheckoutMultifuncionalLineAddonsProps {
  item: CartItem;
  cartLineIds: Set<string>;
  className?: string;
}

function CheckoutMultifuncionalAddonRow({
  kind,
  checked,
  quantity,
  unitUsd,
  onCheckedChange,
  onQuantityChange,
}: {
  kind: CheckoutMultifuncionalAddonKind;
  checked: boolean;
  quantity: number;
  unitUsd: number;
  onCheckedChange: (checked: boolean) => void;
  onQuantityChange: (quantity: number) => void;
}) {
  const addonProduct = resolveCheckoutMultifuncionalAddonProduct(kind);
  const checkboxId = useId();
  const quantityControlId = useId();
  const Icon = ADDON_ICONS[kind];
  const imageUrl = resolveProductImageUrl(addonProduct);

  return (
    <div className="rounded-md border border-border/70 bg-background/80 p-2">
      <div className="flex items-center gap-2">
        <div className="flex size-11 shrink-0 items-center justify-center">
          <Checkbox
            id={checkboxId}
            checked={checked}
            onCheckedChange={(value) => onCheckedChange(value === true)}
            className="size-5"
            aria-describedby={`${checkboxId}-details`}
          />
        </div>
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-muted/30 p-0.5 sm:size-12"
          aria-hidden={imageUrl ? undefined : true}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="max-h-full max-w-full object-contain"
              loading="lazy"
            />
          ) : (
            <Icon className="size-4 text-muted-foreground" />
          )}
        </div>
        <div id={`${checkboxId}-details`} className="min-w-0 flex-1 space-y-1.5">
          <Label
            htmlFor={checkboxId}
            className="flex cursor-pointer items-start gap-1 text-xs font-medium leading-snug sm:text-sm"
          >
            <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span>{addonProduct.name || CHECKOUT_ADDON_LABELS[kind]}</span>
          </Label>

          {checked ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
              <CheckoutCartLineQuantity
                id={quantityControlId}
                product={addonProduct}
                quantity={quantity}
                onDecrease={() => onQuantityChange(quantity - 1)}
                onIncrease={() => onQuantityChange(quantity + 1)}
              />
              <CheckoutCartLinePricing
                unitUsd={unitUsd}
                quantity={quantity}
                compact
                className="sm:min-w-[8.5rem]"
              />
            </div>
          ) : (
            <CheckoutCartLinePricing unitUsd={unitUsd} quantity={1} compact showTotal={false} />
          )}
        </div>
      </div>
    </div>
  );
}

export function CheckoutMultifuncionalLineAddons({
  item,
  cartLineIds,
  className,
}: CheckoutMultifuncionalLineAddonsProps) {
  const { items, addItem, removeItem, updateQuantity } = useCart();
  const panelId = useId();
  const triggerId = useId();
  const [expanded, setExpanded] = useState(false);

  const isMultifuncional = isMultifuncionalCartProduct(item.product);
  const hasCheckedAddon =
    isMultifuncional &&
    CHECKOUT_ADDON_KINDS.some((kind) =>
      cartLineIds.has(buildCheckoutAddonLineId(item.lineId, kind)),
    );

  useEffect(() => {
    if (hasCheckedAddon) setExpanded(true);
  }, [hasCheckedAddon]);

  if (!isMultifuncional) return null;

  const toggleAddon = (kind: CheckoutMultifuncionalAddonKind, checked: boolean) => {
    const addonLineId = buildCheckoutAddonLineId(item.lineId, kind);
    if (checked) {
      const addonProduct = resolveCheckoutMultifuncionalAddonProduct(kind);
      addItem(addonProduct, {
        quantity: item.quantity,
        openDrawer: false,
        fixedLineId: addonLineId,
      });
      return;
    }
    if (cartLineIds.has(addonLineId)) {
      removeItem(addonLineId);
    }
  };

  const changeAddonQuantity = (kind: CheckoutMultifuncionalAddonKind, quantity: number) => {
    const addonLineId = buildCheckoutAddonLineId(item.lineId, kind);
    if (!cartLineIds.has(addonLineId)) return;
    if (quantity <= 0) {
      removeItem(addonLineId);
      return;
    }
    updateQuantity(addonLineId, quantity);
  };

  return (
    <div
      className={cn('mt-2 overflow-hidden rounded-md border border-border/70', className)}
      aria-label={`Complementos para ${item.product.name}`}
    >
      <button
        type="button"
        id={triggerId}
        className="flex min-h-11 w-full items-center gap-2 px-2 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((current) => !current)}
      >
        <Shield className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold text-muted-foreground">Protege tu equipo</span>
          {!expanded ? (
            <span className="mt-0.5 block truncate text-[0.6875rem] text-muted-foreground/80">
              Estabilizador y garantía extendida
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
            expanded && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {expanded ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={triggerId}
          className="space-y-1.5 border-t border-border/70 px-2 py-2"
        >
          {CHECKOUT_ADDON_KINDS.map((kind) => {
            const addonLineId = buildCheckoutAddonLineId(item.lineId, kind);
            const checked = cartLineIds.has(addonLineId);
            const addonItem = items.find((line) => line.lineId === addonLineId);
            const quantity = addonItem?.quantity ?? item.quantity;
            const unitUsd = addonItem
              ? cartLineUnitUsd(addonItem)
              : resolveCheckoutMultifuncionalAddonProduct(kind).price;

            return (
              <CheckoutMultifuncionalAddonRow
                key={kind}
                kind={kind}
                checked={checked}
                quantity={quantity}
                unitUsd={unitUsd}
                onCheckedChange={(nextChecked) => toggleAddon(kind, nextChecked)}
                onQuantityChange={(nextQuantity) => changeAddonQuantity(kind, nextQuantity)}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
