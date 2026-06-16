import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

import { useProductCompare } from '@/context/product-compare-context';
import { cn } from '@/lib/utils';

interface HeaderOrdersCompareProps {
  className?: string;
}

export function HeaderOrdersCompare({ className }: HeaderOrdersCompareProps) {
  const { items, setCompareOpen } = useProductCompare();
  const compareLabel =
    items.length > 0 ? `Comparar, ${items.length} equipos seleccionados` : 'Comparar equipos';

  return (
    <div
      className={cn('flex min-h-9 items-center gap-2 px-3', className)}
      aria-label="Mis pedidos y comparador de equipos"
    >
      <span className="flex size-5 shrink-0 items-center justify-center text-foreground">
        <FileText className="size-4" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-col items-start leading-tight">
        <Link
          to="/mi-cuenta?tab=pedidos"
          className="text-sm font-bold text-foreground transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Mis Pedidos
        </Link>
        <button
          type="button"
          className="text-xs font-normal text-foreground transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={compareLabel}
          onClick={() => setCompareOpen(true)}
        >
          Comparar
        </button>
      </span>
    </div>
  );
}
