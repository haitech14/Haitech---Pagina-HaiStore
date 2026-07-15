import { ProductDetailFichaTecnica } from '@/components/product-detail/product-detail-ficha-tecnica';
import type { ProductSpecRow } from '@/types/product-detail';
import { cn } from '@/lib/utils';

interface ProductDetailSpecsTableProps {
  specs: ProductSpecRow[];
  className?: string;
  variant?: 'default' | 'mockup' | 'ficha';
}

function splitSpecsIntoColumns(specs: ProductSpecRow[]): [ProductSpecRow[], ProductSpecRow[]] {
  const midpoint = Math.ceil(specs.length / 2);
  return [specs.slice(0, midpoint), specs.slice(midpoint)];
}

function MockupSpecColumn({ rows }: { rows: ProductSpecRow[] }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-neutral-200">
      {rows.map((row, index) => (
        <div
          key={row.label}
          className={cn(
            'grid grid-cols-[minmax(0,42%)_1fr] gap-x-2 px-2.5 py-2 text-[11px] sm:gap-x-2.5 sm:px-3 sm:py-2.5 sm:text-xs',
            index % 2 === 0 ? 'bg-neutral-50' : 'bg-white',
          )}
        >
          <span className="font-semibold text-neutral-900">{row.label}</span>
          <span className="text-neutral-700">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

export function ProductDetailSpecsTable({
  specs,
  className,
  variant = 'default',
}: ProductDetailSpecsTableProps) {
  if (specs.length === 0) return null;

  if (variant === 'ficha') {
    return <ProductDetailFichaTecnica specs={specs} {...(className != null ? { className } : {})} />;
  }

  if (variant === 'mockup') {
    const [leftColumn, rightColumn] = splitSpecsIntoColumns(specs);

    return (
      <div className={cn('grid grid-cols-2 gap-2 sm:gap-3', className)}>
        <MockupSpecColumn rows={leftColumn} />
        {rightColumn.length > 0 ? <MockupSpecColumn rows={rightColumn} /> : null}
      </div>
    );
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border bg-background', className)}>
      <table className="w-full border-collapse text-left text-xs sm:text-sm">
        <tbody>
          {specs.map((row, index) => (
            <tr key={row.label} className={cn(index !== specs.length - 1 && 'border-b border-border/60')}>
              <th
                scope="row"
                className="w-[44%] px-4 py-2.5 align-top font-semibold text-foreground sm:py-3"
              >
                {row.label}
              </th>
              <td className="w-6 px-0 py-2.5 align-top text-center font-semibold text-muted-foreground sm:py-3">
                :
              </td>
              <td className="px-4 py-2.5 align-top text-muted-foreground sm:py-3">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
