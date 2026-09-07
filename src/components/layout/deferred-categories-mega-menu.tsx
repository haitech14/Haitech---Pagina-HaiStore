import { lazy, Suspense, useEffect, useState } from 'react';
import { ChevronDown, Menu } from 'lucide-react';

import {
  haitechBlackSubmenuTriggerClass,
  haitechWhiteSubmenuTriggerClass,
  MAIN_NAV_CATEGORIES_BUTTON_CLASS,
  MAIN_NAV_ICON_CLASS,
} from '@/components/layout/main-nav-styles';
import { cn } from '@/lib/utils';

const CategoriesMegaMenu = lazy(() =>
  import('@/components/layout/categories-mega-menu').then((m) => ({
    default: m.CategoriesMegaMenu,
  })),
);

type DeferredCategoriesMegaMenuProps = {
  triggerVariant?: 'button' | 'nav' | 'categories-button' | 'brand-red';
  navRow?: 'default' | 'secondary' | 'light' | 'light-compact' | 'haitech-black' | 'haitech-white';
  showIcon?: boolean;
  label?: string;
  /** Precarga el mega menú (p. ej. nav HAITECH donde el clic debe abrir al primer intento). */
  eager?: boolean;
  triggerHref?: string;
  showChevron?: boolean;
};

function MegaMenuTriggerShell({
  label = 'Categorías',
  triggerVariant = 'button',
  navRow,
  className,
  showChevron = true,
}: {
  label?: string;
  triggerVariant?: DeferredCategoriesMegaMenuProps['triggerVariant'];
  navRow?: DeferredCategoriesMegaMenuProps['navRow'];
  className?: string;
  showChevron?: boolean;
}) {
  if (triggerVariant === 'brand-red') {
    return (
      <button
        type="button"
        aria-label={label}
        className={cn(
          'inline-flex h-9 items-center gap-1.5 rounded-md bg-[#E30613] px-3 text-[13px] font-semibold text-white',
          'transition-colors hover:bg-[#c90511] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/40 focus-visible:ring-offset-2',
          className,
        )}
      >
        <Menu className="size-4 shrink-0" aria-hidden="true" />
        {label}
        <ChevronDown className="size-3.5 shrink-0 opacity-90" aria-hidden="true" />
      </button>
    );
  }

  if (triggerVariant === 'categories-button') {
    return (
      <button
        type="button"
        aria-label={label}
        className={cn(MAIN_NAV_CATEGORIES_BUTTON_CLASS, className)}
      >
        <Menu className={MAIN_NAV_ICON_CLASS} aria-hidden="true" />
        {label}
      </button>
    );
  }

  if (triggerVariant === 'nav') {
    if (navRow === 'haitech-white' || navRow === 'haitech-black') {
      const triggerClass =
        navRow === 'haitech-white'
          ? haitechWhiteSubmenuTriggerClass(false, false)
          : haitechBlackSubmenuTriggerClass(false, false);

      return (
        <button type="button" aria-label={label} className={cn(triggerClass, className)}>
          {label}
          {showChevron ? (
            <ChevronDown className="size-3.5 shrink-0 opacity-80" aria-hidden="true" />
          ) : null}
        </button>
      );
    }

    return (
      <button
        type="button"
        aria-label={label}
        className={cn(
          'inline-flex h-8 items-center gap-1.5 px-2 text-sm font-semibold text-[#111111] hover:bg-black/5',
          className,
        )}
      >
        <Menu className="size-4" aria-hidden="true" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 px-2 text-sm font-semibold text-[#111111] hover:bg-black/5',
        className,
      )}
    >
      <Menu className="size-4" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

/** Mega-menú: placeholder hasta intent; no entra en el chunk crítico del header. */
export function DeferredCategoriesMegaMenu({
  eager = false,
  ...props
}: DeferredCategoriesMegaMenuProps) {
  const [ready, setReady] = useState(eager);
  const warm = () => setReady(true);

  useEffect(() => {
    if (eager) setReady(true);
  }, [eager]);

  const shellProps = {
    ...(props.label ? { label: props.label } : {}),
    ...(props.triggerVariant ? { triggerVariant: props.triggerVariant } : {}),
    ...(props.navRow ? { navRow: props.navRow } : {}),
    ...(props.showChevron === false ? { showChevron: false } : {}),
  };

  if (!ready) {
    return (
      <span
        className={cn(
          'inline-flex items-stretch',
          props.triggerVariant === 'categories-button' && 'flex self-stretch',
        )}
        onFocusCapture={warm}
        onPointerEnter={warm}
        onClickCapture={warm}
      >
        <MegaMenuTriggerShell {...shellProps} />
      </span>
    );
  }

  return (
    <Suspense fallback={<MegaMenuTriggerShell {...shellProps} />}>
      <CategoriesMegaMenu {...props} />
    </Suspense>
  );
}
