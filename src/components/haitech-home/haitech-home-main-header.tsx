import type { ReactNode } from 'react';
import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { FileText, Headphones, ShoppingCart, User } from 'lucide-react';
import { Link } from 'react-router-dom';

import { DeferredSiteSearchForm } from '@/components/layout/deferred-site-search-form';
import { HeaderBrandLogos } from '@/components/layout/site-logo';
import { useCart } from '@/context/cart-context';
import { HAITECH_HOME, HAITECH_HOME_TOPBAR } from '@/data/haitech-home-shell';
import { cn } from '@/lib/utils';

function HeaderAction({
  icon,
  label,
  onClick,
  to,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  to?: string;
}) {
  const className = cn(
    'inline-flex size-10 items-center justify-center rounded-[10px] bg-[#F3F3F3]',
    'text-[#222] transition-colors duration-200 hover:bg-[#EAEAEA]',
  );

  if (to) {
    return (
      <Link to={to} className={className} aria-label={label} title={label}>
        {icon}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className} aria-label={label} title={label}>
      {icon}
    </button>
  );
}

function HeaderSalesSupportContacts({ className }: { className?: string }) {
  const { salesLabel, salesPhone, salesHref, supportLabel, supportPhone, supportHref } =
    HAITECH_HOME_TOPBAR;

  return (
    <div
      className={cn(
        'hidden shrink-0 flex-col justify-center gap-0.5 border-l border-black/[0.06] pl-3 text-[11px] leading-tight sm:flex lg:pl-4 lg:text-[12px]',
        className,
      )}
    >
      <a
        href={salesHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`WhatsApp ${salesLabel}: ${salesPhone}`}
        className="group/sales relative inline-flex items-center gap-2 text-[#222] transition-opacity hover:opacity-80"
      >
        <Icon path={mdiWhatsapp} size={0.95} className="shrink-0 text-[#25D366]" aria-hidden="true" />
        <span className="inline-flex flex-col items-start leading-none">
          <span className="mb-0.5 rounded-sm bg-[#E30613] px-1.5 py-[2px] text-[9px] font-bold uppercase tracking-wide text-white lg:text-[10px]">
            {salesLabel}
          </span>
          <span className="font-sans text-[14px] font-medium tracking-normal text-[#222] whitespace-nowrap lg:text-[15px]">
            {salesPhone}
          </span>
        </span>
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute left-1/2 top-full z-50 mt-1.5 -translate-x-1/2',
            'inline-flex items-center gap-1.5 rounded-md bg-[#111] px-2.5 py-1.5',
            'text-[11px] font-medium whitespace-nowrap text-white shadow-[0_8px_20px_rgba(0,0,0,0.25)]',
            'opacity-0 transition-opacity duration-150 group-hover/sales:opacity-100',
          )}
        >
          <Icon path={mdiWhatsapp} size={0.5} className="shrink-0 text-[#25D366]" aria-hidden="true" />
          Ventas, Alquiler
        </span>
      </a>
      <a
        href={supportHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[#222] transition-opacity hover:opacity-80"
      >
        <Headphones className="size-3 shrink-0 text-[#555]" strokeWidth={1.75} aria-hidden="true" />
        <span className="font-semibold whitespace-nowrap">{supportLabel}</span>
        <span className="tabular-nums text-[#555] whitespace-nowrap">{supportPhone}</span>
      </a>
    </div>
  );
}

export function HaitechHomeMainHeader({ className }: { className?: string }) {
  const { openCart, totalItems } = useCart();

  return (
    <header className={cn('w-full border-b border-black/[0.04] bg-white', className)}>
      <div
        className="mx-auto flex flex-col gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-0 xl:px-6"
        style={{ maxWidth: HAITECH_HOME.maxWidth }}
      >
        <div className="flex items-center gap-2 sm:h-[85px] sm:gap-3 lg:gap-4">
          <HeaderBrandLogos
            heightClass="h-8 sm:h-10 lg:h-11"
            partnerHeightClass="h-9 sm:h-11 lg:h-12"
            width={176}
            height={40}
            loading="eager"
            showPartner
            partnerTone="light"
            className="min-w-0 shrink"
          />

          <DeferredSiteSearchForm
            className={cn(
              'mx-auto hidden w-full max-w-[650px] flex-1 sm:block',
              '[&_form]:h-[43px] [&_form]:rounded-[13px] [&_form]:border-[#D9D9D9] [&_form]:shadow-none',
              '[&_form]:focus-within:border-[#D9D9D9] [&_form]:focus-within:ring-1 [&_form]:focus-within:ring-black/10',
              '[&_input]:h-[43px] [&_input]:pl-10 [&_input]:text-[14px] [&_input]:placeholder:text-[#9A9A9A]',
              '[&_form>svg]:text-[#888] [&_button_svg]:!text-white',
            )}
            variant="segmented"
            size="compact"
            showSearchIcons
            showCategoryFilter={false}
          />

          <HeaderSalesSupportContacts />

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:ml-0 sm:gap-2">
            <HeaderAction
              to="/login"
              icon={<User className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />}
              label="Iniciar sesión"
            />
            <HeaderAction
              to="/mi-cuenta?tab=pedidos"
              icon={<FileText className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />}
              label="Mis Pedidos"
            />
            <HeaderAction
              onClick={openCart}
              icon={
                <span className="relative">
                  <ShoppingCart className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
                  {totalItems > 0 ? (
                    <span
                      className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                      style={{ backgroundColor: HAITECH_HOME.brand }}
                    >
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  ) : null}
                </span>
              }
              label="Mi carrito"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:hidden">
          <DeferredSiteSearchForm
            className={cn(
              'w-full',
              '[&_form]:h-[42px] [&_form]:rounded-[12px] [&_form]:border-[#D9D9D9] [&_form]:shadow-none',
              '[&_form]:focus-within:border-[#D9D9D9] [&_form]:focus-within:ring-1 [&_form]:focus-within:ring-black/10',
              '[&_input]:h-[42px] [&_input]:pl-10 [&_input]:text-[14px] [&_input]:placeholder:text-[#9A9A9A]',
              '[&_form>svg]:text-[#888] [&_button_svg]:!text-white',
            )}
            variant="segmented"
            size="compact"
            showSearchIcons
            showCategoryFilter={false}
          />
          <HeaderSalesSupportContacts className="!flex border-l-0 pl-0" />
        </div>
      </div>
    </header>
  );
}
