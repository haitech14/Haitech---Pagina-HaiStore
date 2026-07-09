import { useEffect, useRef, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

interface CatalogFilterSectionProps {
  title: string;
  children: ReactNode;
  /** Sección abierta al cargar (filtros de uso frecuente). */
  defaultOpen?: boolean;
  /** Mantiene la sección abierta cuando hay un filtro activo */
  openWhenActive?: boolean;
  labelClassName?: string;
  className?: string;
}

/** Bloque de filtros plegable (cerrado por defecto salvo `defaultOpen`). */
export function CatalogFilterSection({
  title,
  children,
  defaultOpen = false,
  openWhenActive = false,
  labelClassName,
  className,
}: CatalogFilterSectionProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (openWhenActive && detailsRef.current) {
      detailsRef.current.open = true;
    }
  }, [openWhenActive]);

  return (
    <details
      ref={detailsRef}
      className={cn('group', className)}
      open={defaultOpen || undefined}
    >
      <summary
        className={cn(
          'flex cursor-pointer list-none items-center justify-between gap-1.5 rounded-md py-0',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          '[&::-webkit-details-marker]:hidden',
          labelClassName,
        )}
      >
        <span>{title}</span>
        <ChevronDown
          className="size-3 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="mt-1">{children}</div>
    </details>
  );
}
