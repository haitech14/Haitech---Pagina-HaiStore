import { ShoppingCart } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { AccountDropdown } from '@/components/layout/account-dropdown';
import { headerDarkUtilityButtonClass } from '@/components/layout/header-action-strip';
import { HeaderCustomerServiceAction } from '@/components/layout/header-customer-service-action';
import { cn } from '@/lib/utils';

type HeaderStoreDesktopActionsProps = {
  cartCount: number;
  cartAriaLabel: string;
  onOpenCart: () => void;
  className?: string;
};

export function HeaderStoreDesktopActions({
  cartCount,
  cartAriaLabel,
  onOpenCart,
  className,
}: HeaderStoreDesktopActionsProps) {
  return (
    <div className={cn('hidden shrink-0 items-center gap-1 lg:flex xl:gap-1.5', className)}>
      <HeaderCustomerServiceAction />

      <AccountDropdown triggerVariant="labeled" tone="dark" />

      <button
        type="button"
        className={cn(headerDarkUtilityButtonClass(), 'relative px-2')}
        aria-label={cartAriaLabel}
        onClick={onOpenCart}
      >
        <span className="relative inline-flex shrink-0">
          <ShoppingCart className="size-4" strokeWidth={1.75} aria-hidden="true" />
          {cartCount > 0 ? (
            <Badge
              className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center bg-[#E30613] px-1 text-[0.6rem] font-semibold text-white"
              aria-hidden="true"
            >
              {cartCount}
            </Badge>
          ) : null}
        </span>
      </button>
    </div>
  );
}
