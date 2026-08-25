import type { ReactNode } from 'react';
import { FileText, ShoppingCart, User } from 'lucide-react';
import { Link } from 'react-router-dom';

import { DeferredSiteSearchForm } from '@/components/layout/deferred-site-search-form';
import { HeaderBrandLogos } from '@/components/layout/site-logo';
import { useCart } from '@/context/cart-context';
import { HAITECH_HOME } from '@/data/haitech-home-shell';
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
    'inline-flex h-[45px] items-center gap-2 rounded-[10px] bg-[#F3F3F3] px-3.5',
    'text-[12px] font-medium text-[#222] transition-colors duration-200 hover:bg-[#EAEAEA]',
  );

  if (to) {
    return (
      <Link to={to} className={className}>
        {icon}
        <span className="hidden whitespace-nowrap xl:inline">{label}</span>
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {icon}
      <span className="hidden whitespace-nowrap xl:inline">{label}</span>
    </button>
  );
}

export function HaitechHomeMainHeader({ className }: { className?: string }) {
  const { openCart, totalItems } = useCart();

  return (
    <header className={cn('w-full border-b border-black/[0.04] bg-white', className)}>
      <div
        className="mx-auto flex h-[85px] items-center gap-4 px-4 xl:gap-6 xl:px-6"
        style={{ maxWidth: HAITECH_HOME.maxWidth }}
      >
        <HeaderBrandLogos
          heightClass="h-10 lg:h-11"
          partnerHeightClass="h-11 lg:h-12"
          width={176}
          height={40}
          loading="eager"
          showPartner
          partnerTone="light"
        />

        <DeferredSiteSearchForm
          className={cn(
            'mx-auto w-full max-w-[650px] flex-1',
            '[&_form]:h-[43px] [&_form]:rounded-[13px] [&_form]:border-[#D9D9D9] [&_form]:shadow-none',
            '[&_form]:focus-within:border-[#D9D9D9] [&_form]:focus-within:ring-1 [&_form]:focus-within:ring-black/10',
            '[&_input]:h-[43px] [&_input]:pl-10 [&_input]:text-[14px] [&_input]:placeholder:text-[#9A9A9A]',
            '[&_svg]:text-[#888]',
          )}
          variant="segmented"
          size="compact"
          showSearchIcons
          showCategoryFilter={false}
        />

        <div className="flex shrink-0 items-center gap-2">
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
    </header>
  );
}
