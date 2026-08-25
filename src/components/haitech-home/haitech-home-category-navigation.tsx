import { useEffect, useRef, useState } from 'react';
import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { ChevronDown } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

import { DeferredCategoriesMegaMenu } from '@/components/layout/deferred-categories-mega-menu';
import {
  HAITECH_HOME,
  HAITECH_NAV_QUOTE_HREF,
  HAITECH_NAV_RECURSOS,
  HAITECH_PRIMARY_CATEGORIES_LEFT,
  HAITECH_PRIMARY_CATEGORIES_RIGHT,
} from '@/data/haitech-home-shell';
import { cn } from '@/lib/utils';

function CategoryNavLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className="inline-flex h-[38px] items-center whitespace-nowrap text-white transition-colors duration-200 hover:text-white/80"
    >
      {label}
    </NavLink>
  );
}

function RecursosDropdown() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="inline-flex h-[38px] items-center gap-1 whitespace-nowrap text-white transition-colors duration-200 hover:text-white/80"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        Recursos
        <ChevronDown
          className={cn('size-3.5 shrink-0 opacity-80 transition-transform', open && 'rotate-180')}
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-0 min-w-[14rem] overflow-hidden rounded-b-md border border-white/10 bg-[#111111] py-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.45)]"
        >
          {HAITECH_NAV_RECURSOS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              role="menuitem"
              className="block px-3.5 py-2 text-[12.5px] font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function HaitechHomeCategoryNavigation({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Navegación principal"
      className={cn(
        'w-full bg-black',
        '[font-family:"Space_Grotesk",Montserrat,system-ui,sans-serif]',
        className,
      )}
    >
      <div
        className="mx-auto flex h-[38px] items-center gap-3 overflow-x-auto px-4 text-[13px] font-medium tracking-[0.01em] text-white xl:gap-4 xl:px-6"
        style={{ maxWidth: HAITECH_HOME.maxWidth }}
      >
        <DeferredCategoriesMegaMenu
          triggerVariant="brand-red"
          label="Productos"
          showIcon={false}
        />

        <ul className="flex min-w-0 items-center gap-3.5 xl:gap-5">
          {HAITECH_PRIMARY_CATEGORIES_LEFT.map((item) => (
            <li key={item.label} className="shrink-0">
              <CategoryNavLink to={item.to} label={item.label} />
            </li>
          ))}
        </ul>

        <span className="mx-1 hidden h-4 w-px shrink-0 bg-white/30 sm:block" aria-hidden="true" />

        <ul className="flex min-w-0 flex-1 items-center gap-3.5 xl:gap-5">
          {HAITECH_PRIMARY_CATEGORIES_RIGHT.map((item) => (
            <li key={item.label} className="shrink-0">
              <CategoryNavLink to={item.to} label={item.label} />
            </li>
          ))}
          <li className="shrink-0">
            <RecursosDropdown />
          </li>
          <li className="shrink-0">
            <CategoryNavLink to="/contacto" label="Contacto" />
          </li>
        </ul>

        <a
          href={HAITECH_NAV_QUOTE_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'ml-auto inline-flex h-[38px] shrink-0 items-center gap-1.5 bg-[#E30613] px-3.5 text-[12.5px] font-semibold text-white',
            'transition-colors hover:bg-[#c90511]',
          )}
        >
          <Icon path={mdiWhatsapp} size={0.7} className="shrink-0 text-white" aria-hidden="true" />
          Comprar por Whatsapp
        </a>
      </div>
    </nav>
  );
}
