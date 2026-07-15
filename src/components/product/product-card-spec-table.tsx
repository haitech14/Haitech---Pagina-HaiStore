import { cn } from '@/lib/utils';
import type { ProductCardSpecRow } from '@/lib/product-card-short-description';

interface ProductCardSpecTableProps {
  rows: ProductCardSpecRow[];
  className?: string;
}

/** Tabla compacta de specs en tarjetas (Funciones / Velocidad+Formato / Producción). */
export function ProductCardSpecTable({ rows, className }: ProductCardSpecTableProps) {
  if (rows.length === 0) return null;

  const byId = new Map(rows.map((row) => [row.id, row]));
  const funciones = byId.get('funciones');
  const velocidad = byId.get('velocidad');
  const formato = byId.get('formato');
  const produccion = byId.get('produccion');

  const velocidadFormato =
    velocidad || formato
      ? [velocidad, formato].filter((row): row is ProductCardSpecRow => Boolean(row))
      : [];

  return (
    <dl
      className={cn(
        'grid gap-0.5 text-left text-[0.6875rem] leading-snug text-[#666666] sm:text-xs',
        className,
      )}
    >
      {funciones ? (
        <div className="grid grid-cols-[4.75rem_1fr] gap-x-1.5 sm:grid-cols-[5.25rem_1fr]">
          <dt className="font-medium text-[#888888]">{funciones.label}</dt>
          <dd className="min-w-0 truncate text-[#555555]">{funciones.value}</dd>
        </div>
      ) : null}

      {velocidadFormato.length > 0 ? (
        <div className="grid grid-cols-[4.75rem_1fr] gap-x-1.5 sm:grid-cols-[5.25rem_1fr]">
          <dt className="font-medium text-[#888888]">
            {velocidad && formato
              ? 'Velocidad, Formato'
              : (velocidad?.label ?? formato?.label)}
          </dt>
          <dd className="min-w-0 truncate text-[#555555]">
            {velocidadFormato.map((row) => row.value).join(' · ')}
          </dd>
        </div>
      ) : null}

      {produccion ? (
        <div className="grid grid-cols-[4.75rem_1fr] gap-x-1.5 sm:grid-cols-[5.25rem_1fr]">
          <dt className="font-medium text-[#888888]">{produccion.label}</dt>
          <dd className="min-w-0 truncate text-[#555555]">{produccion.value}</dd>
        </div>
      ) : null}
    </dl>
  );
}
