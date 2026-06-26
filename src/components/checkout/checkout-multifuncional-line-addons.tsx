import { useId } from 'react';
import { Shield, Zap } from 'lucide-react';

import { DualPrice } from '@/components/product-showcase-card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useCart } from '@/context/cart-context';
import { isMultifuncionalCartProduct } from '@/lib/checkout-cart-product';
import {
  buildCheckoutAddonLineId,
  CHECKOUT_ADDON_KINDS,
  CHECKOUT_ADDON_LABELS,
  resolveCheckoutMultifuncionalAddonProduct,
  type CheckoutMultifuncionalAddonKind,
} from '@/lib/checkout-multifuncional-addons';
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
  item,
  kind,
  checked,
  onCheckedChange,
}: {
  item: CartItem;
  kind: CheckoutMultifuncionalAddonKind;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const addonProduct = resolveCheckoutMultifuncionalAddonProduct(kind);
  const checkboxId = useId();
  const Icon = ADDON_ICONS[kind];

  return (
    <div className="flex items-start gap-2 rounded-md border border-border/70 bg-background/80 p-2">
      <Checkbox
        id={checkboxId}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mt-0.5"
        aria-describedby={`${checkboxId}-price`}
      />
      <div className="min-w-0 flex-1">
        <Label
          htmlFor={checkboxId}
          className="flex cursor-pointer items-center gap-1.5 text-xs font-medium leading-snug sm:text-sm"
        >
          <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          {CHECKOUT_ADDON_LABELS[kind]}
        </Label>
        <p id={`${checkboxId}-price`} className="mt-0.5 text-xs font-semibold text-foreground">
          <DualPrice usd={addonProduct.price} />
          {item.quantity > 1 ? (
            <span className="font-normal text-muted-foreground"> × {item.quantity}</span>
          ) : null}
        </p>
      </div>
    </div>
  );
}

export function CheckoutMultifuncionalLineAddons({
  item,
  cartLineIds,
  className,
}: CheckoutMultifuncionalLineAddonsProps) {
  const { addItem, removeItem } = useCart();

  if (!isMultifuncionalCartProduct(item.product)) return null;

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

  return (
    <div
      className={cn('mt-2 space-y-2', className)}
      aria-label={`Complementos para ${item.product.name}`}
    >
      <p className="text-xs font-semibold text-muted-foreground">Protege tu equipo</p>
      {CHECKOUT_ADDON_KINDS.map((kind) => {
        const addonLineId = buildCheckoutAddonLineId(item.lineId, kind);
        return (
          <CheckoutMultifuncionalAddonRow
            key={kind}
            item={item}
            kind={kind}
            checked={cartLineIds.has(addonLineId)}
            onCheckedChange={(checked) => toggleAddon(kind, checked)}
          />
        );
      })}
    </div>
  );
}
