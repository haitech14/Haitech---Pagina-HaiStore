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
};

function MegaMenuTriggerShell({
  label = 'Categorías',
  triggerVariant = 'button',
  navRow,
  className,
}: {
  label?: string;
  triggerVariant?: DeferredCategoriesMegaMenuProps['triggerVariant'];
  navRow?: DeferredCategoriesMegaMenuProps['navRow'];
  className?: string;
}) {
  if (triggerVariant === 'brand-red') {
    return (
      <button
        type="button"
        aria-label={label}
        className={cn(
          'inline-flex h-[38px] items-center gap-1.5 bg-[#E30613] px-3.5 text-[13px] font-semibold text-white',
          'transition-colors hover:bg-[#c90511]',
          className,
        )}
      >
        {label}
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
          <ChevronDown className="size-3.5 shrink-0 opacity-80" aria-hidden="true" />
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
  };

  if (!ready) {
    return (
      <span
        className={cn(
          'inline-flex items-stretch',
          (props.triggerVariant === 'categories-button' ||
            props.triggerVariant === 'brand-red') &&
            'flex self-stretch',
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
