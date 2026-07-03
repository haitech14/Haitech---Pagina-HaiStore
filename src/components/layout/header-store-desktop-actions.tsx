import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { Headphones, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { AccountDropdown } from '@/components/layout/account-dropdown';
import { headerDarkUtilityButtonClass } from '@/components/layout/header-action-strip';
import { HEADER_ADVISOR_WHATSAPP_LINK, HEADER_SALES_PHONE_DISPLAY } from '@/data/site-header';
import { cn } from '@/lib/utils';

function HeaderDarkDivider() {
  return <span className="mx-2 hidden h-6 w-px shrink-0 bg-white/20 lg:block" aria-hidden="true" />;
}

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
    <div className={cn('hidden shrink-0 items-center lg:flex', className)}>
      <a
        href={HEADER_ADVISOR_WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex shrink-0 items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A1A]"
      >
        <span
          className="flex size-8 items-center justify-center rounded-full bg-[#25D366]/15"
          aria-hidden="true"
        >
          <Icon path={mdiWhatsapp} size={0.9} className="text-[#25D366]" />
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block text-sm font-semibold text-white">{HEADER_SALES_PHONE_DISPLAY}</span>
          <span className="block text-[0.6875rem] text-white/65">Escríbenos por WhatsApp</span>
        </span>
      </a>

      <HeaderDarkDivider />

      <Link
        to="/servicios?seccion=servicio-tecnico"
        className={cn(headerDarkUtilityButtonClass(), 'gap-2 px-2.5')}
      >
        <Headphones className="size-4" strokeWidth={1.75} aria-hidden="true" />
        Soporte
      </Link>

      <HeaderDarkDivider />

      <AccountDropdown triggerVariant="labeled" tone="dark" />

      <HeaderDarkDivider />

      <button
        type="button"
        className={cn(headerDarkUtilityButtonClass(), 'relative gap-2 px-2.5')}
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
        Carrito
      </button>
    </div>
  );
}
