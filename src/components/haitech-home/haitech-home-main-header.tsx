import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { Menu, ShoppingCart, User } from 'lucide-react';
import { Link } from 'react-router-dom';

import { HaitechHomePrimaryNavLinks } from '@/components/haitech-home/haitech-home-secondary-category-nav';
import { AccountDropdown } from '@/components/layout/account-dropdown';
import { DeferredSiteSearchForm } from '@/components/layout/deferred-site-search-form';
import { StorefrontHeaderBrandLogos } from '@/components/layout/site-logo';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import { HAITECH_HOME } from '@/data/haitech-home-shell';
import { HEADER_SALES_PHONE_DISPLAY } from '@/data/site-header';
import { useHaitechWhatsAppQuoteContext } from '@/hooks/use-haitech-whatsapp-quote';
import { openHaitechMobileCategories } from '@/lib/haitech-mobile-nav-events';
import { cn } from '@/lib/utils';

const HEADER_ICON_BUTTON_CLASS =
  'relative inline-flex size-10 shrink-0 items-center justify-center text-[#111] transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/35';

const SEARCH_CLASS = cn(
  'hidden w-full max-w-[340px] flex-1 sm:block xl:max-w-[400px]',
  '[&_form]:h-[42px] [&_form]:rounded-[10px] [&_form]:border-[#D8D8D8] [&_form]:bg-white [&_form]:shadow-none',
  '[&_form]:focus-within:border-[#D8D8D8] [&_form]:focus-within:ring-0',
  '[&_input]:h-[42px] [&_input]:pl-9 [&_input]:text-[13px] [&_input]:placeholder:text-[#9A9A9A]',
  '[&_form>svg]:text-[#B0B0B0] [&_form>button[type=submit]]:!h-[42px] [&_form>button[type=submit]]:!w-11',
  '[&_form>button[type=submit]]:!rounded-none [&_form>button[type=submit]]:!rounded-r-[10px]',
  '[&_form>button[type=submit]]:!bg-[#E30613] [&_form>button[type=submit]_svg]:!text-white',
);

function HeaderAdvisorContact() {
  const { requestQuote } = useHaitechWhatsAppQuoteContext();

  return (
    <button
      type="button"
      onClick={() => requestQuote({ campaign: 'header-ventas' })}
      aria-label={`WhatsApp Habla con un asesor: ${HEADER_SALES_PHONE_DISPLAY}`}
      className="hidden shrink-0 items-center gap-2.5 text-left transition-opacity hover:opacity-80 sm:inline-flex"
    >
      <span
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-[#25D366] text-white"
        aria-hidden="true"
      >
        <Icon path={mdiWhatsapp} size={0.86} color="white" />
      </span>
      <span className="flex flex-col leading-[1.15]">
        <span className="text-[12px] font-normal text-[#333]">Habla con un asesor</span>
        <span className="font-sans text-[16px] font-bold tracking-[0.01em] text-[#111] lg:text-[17px]">
          {HEADER_SALES_PHONE_DISPLAY}
        </span>
      </span>
    </button>
  );
}

function HeaderLoginButton() {
  const { user } = useAuth();

  if (user) {
    return (
      <AccountDropdown
        triggerVariant="icon"
        tone="light"
        className="shrink-0"
        triggerClassName={HEADER_ICON_BUTTON_CLASS}
        iconClassName="size-[22px]"
      />
    );
  }

  return (
    <Link
      to="/login"
      className={HEADER_ICON_BUTTON_CLASS}
      aria-label="Iniciar sesión"
      title="Iniciar sesión"
    >
      <User className="size-[22px]" strokeWidth={1.75} aria-hidden="true" />
    </Link>
  );
}

function HeaderCartButton() {
  const { openCart, totalItems } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      className={HEADER_ICON_BUTTON_CLASS}
      aria-label={totalItems > 0 ? `Mi carrito, ${totalItems} productos` : 'Mi carrito'}
      title="Mi carrito"
    >
      <ShoppingCart className="size-[22px]" strokeWidth={1.75} aria-hidden="true" />
      {totalItems > 0 ? (
        <span
          className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
          style={{ backgroundColor: HAITECH_HOME.brand }}
        >
          {totalItems > 9 ? '9+' : totalItems}
        </span>
      ) : null}
    </button>
  );
}

export function HaitechHomeMainHeader({ className }: { className?: string }) {
  return (
    <header className={cn('w-full border-b border-[#EFEFEF] bg-white', className)}>
      <div
        className="mx-auto flex flex-col gap-2 px-3 py-2 sm:px-4 sm:py-0 xl:px-6"
        style={{ maxWidth: HAITECH_HOME.maxWidth }}
      >
        <div className="flex items-center gap-3 sm:h-[76px] sm:gap-4 lg:gap-5">
          <button
            type="button"
            className="inline-flex size-9 shrink-0 items-center justify-center text-[#222] lg:hidden"
            aria-label="Abrir menú"
            onClick={openHaitechMobileCategories}
          >
            <Menu className="size-6" strokeWidth={1.75} aria-hidden="true" />
          </button>

          <StorefrontHeaderBrandLogos
            heightClass="h-8 sm:h-10 lg:h-11"
            width={197}
            height={53}
            loading="eager"
            className="shrink-0"
          />

          <nav aria-label="Menú principal" className="hidden min-w-0 self-stretch lg:flex">
            <HaitechHomePrimaryNavLinks />
          </nav>

          <DeferredSiteSearchForm
            className={SEARCH_CLASS}
            variant="segmented"
            size="compact"
            showSearchIcons
            showCategoryFilter={false}
            placeholder="Buscar equipos RICOH..."
          />

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <HeaderAdvisorContact />
            <HeaderLoginButton />
            <HeaderCartButton />
          </div>
        </div>

        <div className="px-1 sm:hidden" data-haitech-mobile-search>
          <DeferredSiteSearchForm
            className={cn(
              'w-full',
              '[&_form]:h-[38px] [&_form]:rounded-[10px] [&_form]:border-[#D8D8D8] [&_form]:shadow-none',
              '[&_input]:h-[38px] [&_input]:pl-9 [&_input]:text-[13px] [&_input]:placeholder:text-[#9A9A9A]',
              '[&_form>button[type=submit]]:!rounded-[9px] [&_form>button[type=submit]]:!bg-[#E30613]',
              '[&_form>button[type=submit]_svg]:!text-white',
            )}
            variant="segmented"
            size="compact"
            showSearchIcons
            showCategoryFilter={false}
            placeholder="Buscar equipos RICOH..."
          />
        </div>
      </div>
    </header>
  );
}
