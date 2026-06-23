import type { ProductSpecRow } from '@/types/product-detail';
import { cn } from '@/lib/utils';

interface ProductDetailSpecsTableProps {
  specs: ProductSpecRow[];
  className?: string;
}

export function ProductDetailSpecsTable({ specs, className }: ProductDetailSpecsTableProps) {
  if (specs.length === 0) return null;

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
