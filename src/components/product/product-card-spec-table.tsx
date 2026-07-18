import { cn } from '@/lib/utils';
import { PRODUCTION_FILTER_OPTIONS } from '@/lib/category-catalog-filters';
import type { ProductCardSpecRow } from '@/lib/product-card-short-description';

interface ProductCardSpecTableProps {
  rows: ProductCardSpecRow[];
  className?: string;
  /** Tipografía más legible (p. ej. ficha de toner). */
  size?: 'compact' | 'comfortable';
}

type DisplayRow = {
  id: string;
  label: string;
  value: string;
  display: string;
};

function normalizeToken(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

/** Acorta tiers de producción conocidos; el valor completo queda en `title`. */
function formatProduccionDisplay(value: string): string {
  const match = PRODUCTION_FILTER_OPTIONS.find(
    (opt) => opt.value === value || opt.label === value,
  );
  return match?.sidebarLabel ?? value;
}

/**
 * Acorta funciones largas en la celda: «Copiadora, Impresora, Escáner y fax» → «Copia · Imp · Scan · Fax».
 * El valor canónico sigue en tooltip.
 */
function formatFuncionesDisplay(value: string): string {
  const parts = value
    .split(/[,/;|]+|\s+y\s+|\s+e\s+/i)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return value;

  const mapped: string[] = [];
  for (const part of parts) {
    const key = normalizeToken(part);
    let short: string;
    if (/copi/.test(key)) short = 'Copia';
    else if (/impres/.test(key)) short = 'Imp';
    else if (/escan|scan/.test(key)) short = 'Scan';
    else if (/fax/.test(key)) short = 'Fax';
    else short = part;
    if (!mapped.some((item) => normalizeToken(item) === normalizeToken(short))) {
      mapped.push(short);
    }
  }

  return mapped.length > 0 ? mapped.join(' · ') : value;
}

function formatCardSpecDisplay(row: ProductCardSpecRow): string {
  if (row.id === 'produccion') return formatProduccionDisplay(row.value);
  if (row.id === 'funciones') return formatFuncionesDisplay(row.value);
  return row.value;
}

/**
 * Mini tabla de specs en tarjetas (Funciones / Velocidad / Formato / Producción).
 * Un poco más densa que la primera versión (texto y padding menores).
 */
export function ProductCardSpecTable({
  rows,
  className,
  size = 'compact',
}: ProductCardSpecTableProps) {
  if (rows.length === 0) return null;

  const byId = new Map(rows.map((row) => [row.id, row]));
  const ordered: ProductCardSpecRow[] = [];
  const preferredOrder = (
    rows.some((row) =>
      ['marca', 'sku', 'color', 'rendimiento', 'compatibilidad'].includes(row.id),
    )
      ? (['marca', 'sku', 'color', 'rendimiento', 'compatibilidad'] as const)
      : (['funciones', 'velocidad', 'formato', 'produccion'] as const)
  );
  for (const id of preferredOrder) {
    const row = byId.get(id);
    if (row) ordered.push(row);
  }
  for (const row of rows) {
    if (!ordered.some((item) => item.id === row.id)) ordered.push(row);
  }

  const displayRows: DisplayRow[] = ordered.map((row) => ({
    id: row.id,
    label: row.label,
    value: row.value,
    display: formatCardSpecDisplay(row),
  }));

  const comfortable = size === 'comfortable';

  return (
    <div
      className={cn(
        'overflow-hidden rounded-md border border-[#E6E8EE] bg-white text-left',
        className,
      )}
    >
      <table
        className={cn(
          'w-full table-fixed border-collapse',
          comfortable
            ? 'text-xs leading-snug sm:text-sm sm:leading-normal'
            : 'text-[0.625rem] leading-tight sm:text-[0.6875rem] sm:leading-snug',
        )}
      >
        <tbody>
          {displayRows.map((row, index) => {
            const showTitle = row.value.length > 28 || row.display !== row.value;
            return (
              <tr
                key={row.id}
                className={cn(
                  index % 2 === 0 ? 'bg-[#F7F8FA]' : 'bg-white',
                  index !== displayRows.length - 1 && 'border-b border-[#E6E8EE]',
                )}
              >
                <th
                  scope="row"
                  className={cn(
                    'w-[36%] max-w-[5rem] align-top font-medium text-[#888888]',
                    comfortable
                      ? 'px-2 py-1.5 sm:px-2.5 sm:py-2'
                      : 'px-1 py-0.5 sm:px-1.5 sm:py-1',
                  )}
                >
                  {row.label}
                </th>
                <td
                  className={cn(
                    'min-w-0 align-top font-medium text-[#444444]',
                    comfortable
                      ? 'px-2 py-1.5 sm:px-2.5 sm:py-2'
                      : 'px-1 py-0.5 sm:px-1.5 sm:py-1',
                  )}
                  {...(showTitle ? { title: row.value } : {})}
                >
                  <span className="line-clamp-2 break-words [overflow-wrap:anywhere]">
                    {row.display}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
