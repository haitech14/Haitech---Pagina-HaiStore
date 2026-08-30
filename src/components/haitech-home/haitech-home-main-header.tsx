import { useState, type ReactNode } from 'react';
import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { Headphones, ChevronDown, Heart, Menu, ShoppingCart, User } from 'lucide-react';
import { Link } from 'react-router-dom';

import { DeferredSiteSearchForm } from '@/components/layout/deferred-site-search-form';
import { HeaderCurrencySymbolToggle, resolveHeaderCurrencyLabel } from '@/components/layout/header-currency-control';
import { StorefrontHeaderBrandLogos } from '@/components/layout/site-logo';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCart } from '@/context/cart-context';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { useWishlist } from '@/context/wishlist-context';
import { HAITECH_HOME, HAITECH_HOME_TOPBAR } from '@/data/haitech-home-shell';
import { HEADER_SALES_PHONE_DISPLAY, HEADER_SUPPORT_PHONE_DISPLAY } from '@/data/site-header';
import { useHaitechWhatsAppQuoteContext } from '@/hooks/use-haitech-whatsapp-quote';
import { openHaitechMobileCategories } from '@/lib/haitech-mobile-nav-events';
import { cn } from '@/lib/utils';

const HEADER_PHONE_NUMBER_CLASS =
  'font-sans text-[14px] font-semibold tracking-[0.02em] text-[#222] lg:text-[15px]';

function HeaderAction({
  icon,
  label,
  onClick,
  to,
  className,
  bare = false,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  to?: string;
  className?: string;
  /** Sin fondo gris — estilo iconos del mockup móvil. */
  bare?: boolean;
}) {
  const classes = cn(
    bare
      ? 'inline-flex size-9 items-center justify-center text-[#222] transition-opacity hover:opacity-70'
      : 'inline-flex size-10 items-center justify-center rounded-[10px] bg-[#F3F3F3] text-[#222] transition-colors duration-200 hover:bg-[#EAEAEA]',
    className,
  );

  if (to) {
    return (
      <Link to={to} className={classes} aria-label={label} title={label}>
        {icon}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes} aria-label={label} title={label}>
      {icon}
    </button>
  );
}

function HeaderIconBadge({ count }: { count: number }) {
  return (
    <span
      className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
      style={{ backgroundColor: HAITECH_HOME.brand }}
    >
      {count > 9 ? '9+' : count}
    </span>
  );
}

function HeaderCurrencyAction() {
  const [open, setOpen] = useState(false);
  const { displayCurrency, dualPriceOrder } = useDisplayCurrency();
  const label = resolveHeaderCurrencyLabel(displayCurrency, dualPriceOrder);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 items-center justify-center gap-0.5 px-1 text-[#222] transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/30 focus-visible:ring-offset-2"
          aria-label={`Moneda: ${label}. Cambiar moneda de visualización`}
          title="Cambiar moneda"
          aria-expanded={open}
        >
          <span className="text-[12px] font-bold leading-none tracking-tight tabular-nums">{label}</span>
          <ChevronDown
            className={cn(
              'size-3 shrink-0 opacity-70 transition-transform duration-200',
              open && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-auto p-1.5">
        <HeaderCurrencySymbolToggle
          buttonClassName="min-h-7 rounded-md px-2 text-[11px] font-semibold"
          activeClassName="bg-[#E30613] text-white"
          inactiveClassName="text-[#666] hover:bg-[#F3F3F3] hover:text-[#111]"
        />
      </PopoverContent>
    </Popover>
  );
}

function HeaderSalesSupportContacts({ className }: { className?: string }) {
  const { salesLabel, supportLabel, supportHref } = HAITECH_HOME_TOPBAR;
  const { requestQuote } = useHaitechWhatsAppQuoteContext();

  return (
    <div
      className={cn(
        'hidden shrink-0 items-center gap-3 border-l border-black/[0.08] pl-3 sm:flex lg:gap-4 lg:pl-4',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => requestQuote({ campaign: 'header-ventas' })}
        aria-label={`WhatsApp ${salesLabel}: ${HEADER_SALES_PHONE_DISPLAY}`}
        className="inline-flex items-center gap-2 text-left transition-opacity hover:opacity-80"
      >
        <span
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-[0.45rem] bg-[#25D366] text-white"
          aria-hidden="true"
        >
          <Icon path={mdiWhatsapp} size={0.72} color="white" />
        </span>
        <span className="flex flex-col leading-[1.15]">
          <span className="text-[11px] font-normal text-[#888]">{salesLabel}</span>
          <span className={HEADER_PHONE_NUMBER_CLASS}>
            {HEADER_SALES_PHONE_DISPLAY}
          </span>
        </span>
      </button>

      <span className="h-8 w-px shrink-0 bg-black/[0.08]" aria-hidden="true" />

      <a
        href={supportHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
        aria-label={`${supportLabel}: ${HEADER_SUPPORT_PHONE_DISPLAY}`}
      >
        <span
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-[#25D366]/35 bg-transparent"
          aria-hidden="true"
        >
          <Headphones className="size-4 text-[#25D366]" strokeWidth={1.75} />
        </span>
        <span className="flex flex-col leading-[1.15]">
          <span className="text-[11px] font-normal text-[#888]">{supportLabel}</span>
          <span className={HEADER_PHONE_NUMBER_CLASS}>
            {HEADER_SUPPORT_PHONE_DISPLAY}
          </span>
        </span>
      </a>
    </div>
  );
}

export function HaitechHomeMainHeader({ className }: { className?: string }) {
  const { openCart, totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();

  return (
    <header className={cn('w-full bg-white', className)}>
      <div
        className="mx-auto flex flex-col gap-2 px-3 py-2 sm:gap-2.5 sm:px-4 sm:py-0 xl:px-6"
        style={{ maxWidth: HAITECH_HOME.maxWidth }}
      >
        <div className="flex items-center gap-1.5 sm:h-[72px] sm:gap-2.5 lg:gap-3">
          {/* Hamburger solo móvil */}
          <button
            type="button"
            className="inline-flex size-9 shrink-0 items-center justify-center text-[#222] sm:hidden"
            aria-label="Abrir menú"
            onClick={openHaitechMobileCategories}
          >
            <Menu className="size-6" strokeWidth={1.75} aria-hidden="true" />
          </button>

          <StorefrontHeaderBrandLogos
            heightClass="h-7 sm:h-9 lg:h-10"
            width={197}
            height={53}
            loading="eager"
            className="shrink-0"
          />

          <DeferredSiteSearchForm
            className={cn(
              'mx-auto hidden w-full max-w-[520px] flex-1 sm:block',
              '[&_form]:h-[36px] [&_form]:rounded-[11px] [&_form]:border-[#D9D9D9] [&_form]:shadow-none',
              '[&_form]:focus-within:border-[#D9D9D9] [&_form]:focus-within:ring-1 [&_form]:focus-within:ring-black/10',
              '[&_input]:h-[36px] [&_input]:pl-9 [&_input]:text-[13px] [&_input]:placeholder:text-[#9A9A9A]',
              '[&_button]:!size-9 [&_form>svg]:text-[#888] [&_button_svg]:!text-white',
            )}
            variant="segmented"
            size="compact"
            showSearchIcons
            showCategoryFilter={false}
          />

          <HeaderSalesSupportContacts />

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:ml-0 sm:gap-2.5">
            <HeaderAction
              bare
              to="/login"
              icon={<User className="size-[20px]" strokeWidth={1.75} aria-hidden="true" />}
              label="Iniciar sesión"
            />
            <HeaderAction
              bare
              onClick={openCart}
              icon={
                <span className="relative">
                  <ShoppingCart className="size-[20px]" strokeWidth={1.75} aria-hidden="true" />
                  <HeaderIconBadge count={totalItems} />
                </span>
              }
              label="Mi carrito"
            />
            <HeaderAction
              bare
              className="hidden sm:inline-flex"
              to="/favoritos"
              icon={
                <span className="relative">
                  <Heart className="size-[20px]" strokeWidth={1.75} aria-hidden="true" />
                  <HeaderIconBadge count={wishlistCount} />
                </span>
              }
              label="Mis favoritos"
            />
            <div className="hidden sm:block">
              <HeaderCurrencyAction />
            </div>
          </div>
        </div>

        <div className="px-1 sm:hidden" data-haitech-mobile-search>
          <DeferredSiteSearchForm
            className={cn(
              'w-full',
              '[&_form]:h-[38px] [&_form]:rounded-[11px] [&_form]:border-[#D9D9D9] [&_form]:shadow-none',
              '[&_form]:focus-within:border-[#D9D9D9] [&_form]:focus-within:ring-1 [&_form]:focus-within:ring-black/10',
              '[&_input]:h-[38px] [&_input]:pl-9 [&_input]:text-[13px] [&_input]:placeholder:text-[#9A9A9A]',
              '[&_button]:!size-9 [&_form>svg]:text-[#888] [&_button_svg]:!text-white',
              '[&_button]:!rounded-[9px] [&_button]:!bg-[#E30613]',
            )}
            variant="segmented"
            size="compact"
            showSearchIcons
            showCategoryFilter={false}
          />
        </div>
      </div>
    </header>
  );
}
