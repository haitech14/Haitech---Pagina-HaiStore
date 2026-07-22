import { lazy, Suspense, useState } from 'react';
import { Menu } from 'lucide-react';

import {
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
  triggerVariant?: 'button' | 'nav' | 'categories-button';
  navRow?: 'default' | 'secondary' | 'light' | 'light-compact';
  showIcon?: boolean;
  label?: string;
};

function MegaMenuTriggerShell({
  label = 'Categorías',
  triggerVariant = 'button',
  className,
}: {
  label?: string;
  triggerVariant?: DeferredCategoriesMegaMenuProps['triggerVariant'];
  className?: string;
}) {
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
export function DeferredCategoriesMegaMenu(props: DeferredCategoriesMegaMenuProps) {
  const [ready, setReady] = useState(false);
  const warm = () => setReady(true);
  const shellProps = {
    ...(props.label ? { label: props.label } : {}),
    ...(props.triggerVariant ? { triggerVariant: props.triggerVariant } : {}),
  };

  if (!ready) {
    return (
      <span
        className={cn(
          'inline-flex',
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
