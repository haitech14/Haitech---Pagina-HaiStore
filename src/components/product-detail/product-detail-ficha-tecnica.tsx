import { useMemo } from 'react';

import type { ProductSpecRow } from '@/types/product-detail';
import { groupSpecsForFichaTecnica } from '@/lib/product-spec-groups';
import { cn } from '@/lib/utils';

/** Bordes y fondos de celdas (mockup Ricoh-style). */
const FICHA_BORDER = '#d4d4d4';
const FICHA_LABEL_BG = '#f0f0f0';

interface ProductDetailFichaTecnicaProps {
  specs: ProductSpecRow[];
  className?: string;
}

function FichaTecnicaSectionTable({ title, rows }: { title: string; rows: ProductSpecRow[] }) {
  if (rows.length === 0) return null;

  return (
    <section className="space-y-2">
      <h3 className="text-center text-xs font-bold leading-tight text-foreground sm:text-sm">
        {title}
      </h3>

      <div className="bg-white" style={{ border: `1px solid ${FICHA_BORDER}` }}>
        <table className="w-full table-fixed border-collapse text-[10px] sm:text-[11px]">
          <tbody>
            {rows.map((row) => (
              <tr key={`${title}-${row.label}`}>
                <th
                  scope="row"
                  className="w-[40%] px-2 py-1.5 text-left align-middle font-bold text-neutral-900 sm:px-3 sm:py-2"
                  style={{
                    backgroundColor: FICHA_LABEL_BG,
                    border: `1px solid ${FICHA_BORDER}`,
                  }}
                >
                  {row.label}
                </th>
                <td
                  className="break-words bg-white px-2 py-1.5 text-center align-middle font-normal text-neutral-800 sm:px-3 sm:py-2"
                  style={{ border: `1px solid ${FICHA_BORDER}` }}
                >
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
  const sections = useMemo(() => groupSpecsForFichaTecnica(specs), [specs]);

  if (specs.length === 0) return null;

  return (
    <div className={cn('space-y-4 bg-white sm:space-y-5', className)}>
      {sections.map((section) => (
        <FichaTecnicaSectionTable key={section.title} title={section.title} rows={section.rows} />
      ))}
    </div>
  );
}
