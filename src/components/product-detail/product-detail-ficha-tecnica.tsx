import type { ProductSpecRow } from '@/types/product-detail';
import { groupSpecsForFichaTecnica } from '@/lib/product-spec-groups';
import { cn } from '@/lib/utils';

interface ProductDetailFichaTecnicaProps {
  specs: ProductSpecRow[];
  className?: string;
}

function FichaTecnicaSectionTable({ title, rows }: { title: string; rows: ProductSpecRow[] }) {
  return (
    <section className="space-y-2">
      <div className="flex items-stretch gap-2">
        <div className="shrink-0 self-stretch border-l-4 border-blue-300" aria-hidden="true" />
        <h3 className="flex-1 py-0.5 text-center text-sm font-bold text-blue-600 sm:text-base">{title}</h3>
      </div>

      <div className="overflow-hidden rounded-sm border border-neutral-200">
        <table className="w-full border-collapse text-[11px] sm:text-xs">
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={`${title}-${row.label}`}
                className={cn(index < rows.length - 1 && 'border-b border-neutral-200')}
              >
                <th
                  scope="row"
                  className="w-[50%] border-r border-neutral-200 bg-[#f5f5f5] px-2.5 py-2 text-left font-bold text-neutral-900 sm:px-3 sm:py-2.5"
                >
                  {row.label}
                </th>
                <td className="bg-white px-2.5 py-2 text-center text-neutral-700 sm:px-3 sm:py-2.5">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ProductDetailFichaTecnica({ specs, className }: ProductDetailFichaTecnicaProps) {
  if (specs.length === 0) return null;

  const sections = groupSpecsForFichaTecnica(specs);

  return (
    <div className={cn('space-y-5 sm:space-y-6', className)}>
      {sections.map((section) => (
        <FichaTecnicaSectionTable key={section.title} title={section.title} rows={section.rows} />
      ))}
    </div>
  );
}
