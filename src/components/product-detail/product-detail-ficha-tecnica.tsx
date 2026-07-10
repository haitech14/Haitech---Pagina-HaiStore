import { useMemo, useState } from 'react';

import type { ProductSpecRow } from '@/types/product-detail';
import { groupSpecsForFichaTecnica, type FichaTecnicaSection } from '@/lib/product-spec-groups';
import { cn } from '@/lib/utils';

/** Bordes y fondos de celdas (mockup Ricoh-style). */
const FICHA_BORDER = '#d4d4d4';
const FICHA_LABEL_BG = '#f0f0f0';

/** Filas visibles por defecto antes de «Ver Más». */
const COLLAPSED_MAX_ROWS = 8;

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

      <div className="overflow-hidden bg-white" style={{ border: `1px solid ${FICHA_BORDER}` }}>
        <table className="w-full border-collapse text-[10px] sm:text-[11px]">
          <tbody>
            {rows.map((row) => (
              <tr key={`${title}-${row.label}`}>
                <th
                  scope="row"
                  className="w-[48%] px-2 py-1.5 text-left align-middle font-bold text-neutral-900 sm:w-[50%] sm:px-2.5 sm:py-2"
                  style={{
                    backgroundColor: FICHA_LABEL_BG,
                    border: `1px solid ${FICHA_BORDER}`,
                  }}
                >
                  {row.label}
                </th>
                <td
                  className="bg-white px-2 py-1.5 text-center align-middle font-normal text-neutral-800 sm:px-2.5 sm:py-2"
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

function collapseSections(sections: FichaTecnicaSection[]): FichaTecnicaSection[] {
  if (sections.length === 0) return [];

  const first = sections[0];
  return [{ title: first.title, rows: first.rows.slice(0, COLLAPSED_MAX_ROWS) }];
}

function countRows(sections: FichaTecnicaSection[]): number {
  return sections.reduce((sum, section) => sum + section.rows.length, 0);
}

export function ProductDetailFichaTecnica({ specs, className }: ProductDetailFichaTecnicaProps) {
  const [expanded, setExpanded] = useState(false);

  const sections = useMemo(() => groupSpecsForFichaTecnica(specs), [specs]);
  const totalRows = countRows(sections);
  const collapsedSections = useMemo(() => collapseSections(sections), [sections]);
  const collapsedRows = countRows(collapsedSections);
  const canToggle = totalRows > collapsedRows;

  if (specs.length === 0) return null;

  const visibleSections = expanded || !canToggle ? sections : collapsedSections;

  return (
    <div className={cn('space-y-4 bg-white sm:space-y-5', className)}>
      {visibleSections.map((section) => (
        <FichaTecnicaSectionTable key={section.title} title={section.title} rows={section.rows} />
      ))}

      {canToggle ? (
        <div className="flex justify-center pt-0.5">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="text-xs font-bold text-blue-600 hover:text-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 sm:text-sm"
            aria-expanded={expanded}
          >
            {expanded ? 'Ver menos' : 'Ver Más'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
