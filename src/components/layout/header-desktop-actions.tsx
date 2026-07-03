import { ShoppingCart } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { AccountDropdown } from '@/components/layout/account-dropdown';
import { HeaderDarkCurrencyControl } from '@/components/layout/header-currency-control';
import {
  headerDarkUtilityButtonClass,
  headerIconActionButtonClass,
  type HeaderActionTone,
} from '@/components/layout/header-action-strip';
import { useCart } from '@/context/cart-context';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { cn, formatPenFromUsd } from '@/lib/utils';

type HeaderDesktopActionsProps = {
  variant?: HeaderActionTone;
  className?: string;
  /** Muestra selector de moneda (icono + $ / S/). */
  showCurrency?: boolean;
  /** Botones con etiqueta «Mi Cuenta» y «Carrito». */
  labeled?: boolean;
};

export function HeaderDesktopActions({
  variant = 'light',
  className,
  showCurrency = false,
  labeled = false,
}: HeaderDesktopActionsProps) {
  const { totalItems, totalPrice, openCart } = useCart();
  const { displayCurrency } = useDisplayCurrency();
  const cartTotalAria =
    displayCurrency === 'PEN'
      ? `${formatPenFromUsd(totalPrice)}, tipo de cambio venta`
      : `${totalPrice.toFixed(2)} dólares`;

  return (
    <div className={cn('hidden shrink-0 items-center gap-2 lg:flex', className)}>
      {showCurrency ? <HeaderDarkCurrencyControl /> : null}

      <AccountDropdown
        triggerVariant={labeled ? 'labeled' : 'strip'}
        tone={variant}
      />

      <button
        type="button"
        className={cn(
          labeled ? headerDarkUtilityButtonClass() : headerIconActionButtonClass(variant, 'sm'),
        )}
        aria-label={`Carrito de compras, ${totalItems} artículos, total ${cartTotalAria}`}
        onClick={openCart}
      >
        <ShoppingCart className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
        {labeled ? <span>Carrito</span> : null}
        {totalItems > 0 ? (
          <Badge
            className={cn(
              'absolute -right-0.5 -top-0.5 h-3.5 min-w-3.5 justify-center px-0.5 text-[0.55rem] text-white',
              variant === 'dark' ? 'bg-white text-red-600' : 'bg-red-600 text-white',
            )}
            aria-hidden="true"
          >
            {totalItems}
          </Badge>
        ) : null}
      </button>
    </div>
  );
}
