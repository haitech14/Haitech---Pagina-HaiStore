import { Link } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';

import { productPath } from '@/lib/product-path';
import type { ProductComparisonColumn, ProductComparisonData } from '@/lib/product-equipment-comparison';
import { splitComparisonModelLabel } from '@/lib/product-equipment-comparison';
import { cn } from '@/lib/utils';

interface ProductDetailComparisonProps {
  data: ProductComparisonData;
  className?: string;
}

function ComparisonModelLabel({
  label,
  className,
  productId,
}: {
  label: string;
  className: string;
  productId?: string;
}) {
  const { prefix, model } = splitComparisonModelLabel(label);

  const content =
    prefix != null ? (
      <span className="flex w-full flex-col items-center gap-0.5">
        <span className="text-[0.625rem] font-semibold leading-tight text-inherit opacity-90 sm:text-[0.6875rem]">
          {prefix}
        </span>
        <span className={cn(className, 'text-balance leading-tight')}>{model}</span>
      </span>
    ) : (
      <span className={cn(className, 'text-balance leading-tight')}>{label}</span>
    );

  if (productId) {
    return (
      <Link
        to={productPath(productId)}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
      >
        {content}
      </Link>
    );
  }

  return content;
}

function ComparisonColumnHeader({
  column,
  highlighted = false,
}: {
  column: ProductComparisonColumn;
  highlighted?: boolean;
}) {
  const labelClass = highlighted
    ? 'text-sm font-bold text-red-600 hover:text-red-500 sm:text-base'
    : 'text-sm font-bold text-[#0f1f3d] hover:text-red-600 sm:text-base';

  return (
    <div
      className={cn(
        'mx-auto flex w-full min-h-[10.5rem] max-w-[11rem] flex-col items-center justify-end gap-2 rounded-lg p-2.5 sm:min-h-[11.5rem] sm:max-w-[12rem] sm:gap-2.5 sm:p-3',
        highlighted
          ? 'border border-red-600/30 bg-red-50/90 ring-1 ring-red-600/20'
          : 'border border-transparent bg-transparent',
      )}
    >
      <div className="flex h-24 w-full flex-1 items-center justify-center sm:h-28 md:h-32">
        {column.image ? (
          <img
            src={column.image}
            alt=""
            className="max-h-full max-w-full object-contain object-bottom"
            loading="lazy"
          />
        ) : (
          <span className="text-xs font-semibold text-muted-foreground">Sin Imagen</span>
        )}
      </div>

      <div className="flex w-full flex-col items-center gap-0.5 text-center">
        <ComparisonModelLabel
          label={column.modelLabel}
          className={labelClass}
          {...(column.productId ? { productId: column.productId } : {})}
        />
        {highlighted ? (
          <span className="text-[0.6875rem] font-medium leading-none text-red-600 sm:text-xs">
            (este equipo)
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ComparisonCellValue({
  value,
  emphasize = false,
}: {
  value: boolean | string | undefined;
  emphasize?: boolean;
}) {
  if (value === true) {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
        <span className="sr-only">Sí</span>
      </span>
    );
  }

  return (
    <span className={cn(emphasize && 'font-bold')}>
      {typeof value === 'string' ? value : '—'}
    </span>
  );
}

export function ProductDetailComparison({ data, className }: ProductDetailComparisonProps) {
  if (data.columns.length === 0) return null;

  const otherColumns = data.columns.filter((column) => !column.isCurrent);
  const currentColumn = data.columns.find((column) => column.isCurrent) ?? data.columns[0];

  return (
    <section
      className={cn('mt-10 border-t border-border/60 pt-8 sm:mt-12', className)}
      aria-labelledby="comparacion-titulo"
    >
      <div className="mb-5 sm:mb-6">
        <h2 id="comparacion-titulo" className="text-lg font-bold text-[#0f1f3d] sm:text-xl">
          {data.title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{data.subtitle}</p>
      </div>

      <div className="space-y-4 md:hidden">
        {data.columns.map((column) => (
          <article
            key={column.modelLabel}
            className={cn(
              'rounded-xl border p-4 shadow-sm',
              column.isCurrent
                ? 'border-red-600/30 bg-red-50/50 ring-1 ring-red-600/15'
                : 'border-border/70 bg-card',
            )}
          >
            <ComparisonColumnHeader column={column} highlighted={column.isCurrent} />
            <dl className="mt-4 divide-y divide-border/60 text-sm">
              {data.rows.map((row) => (
                <div key={row.id} className="flex items-start justify-between gap-3 py-2.5">
                  <dt className="min-w-0 flex-1 font-medium text-[#0f1f3d]">{row.label}</dt>
                  <dd className="shrink-0 text-right text-[#0f1f3d]">
                    <ComparisonCellValue
                      value={column.values[row.id]}
                      emphasize={column.isCurrent && row.id === 'volume'}
                    />
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[48rem] border-collapse text-sm sm:min-w-[56rem]">
          <thead>
            <tr>
              <th scope="col" className="w-[30%] border-b border-border/60 pb-4 align-bottom" />
              {otherColumns.map((column) => (
                <th
                  key={column.modelLabel}
                  scope="col"
                  className="w-[17.5%] border-b border-border/60 px-2 pb-4 align-bottom sm:px-3"
                >
                  <ComparisonColumnHeader column={column} />
                </th>
              ))}
              <th
                scope="col"
                className="w-[17.5%] border-b border-border/60 px-2 pb-4 align-bottom sm:px-3"
              >
                <ComparisonColumnHeader column={currentColumn} highlighted />
              </th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rowIndex) => (
              <tr key={row.id} className={cn(rowIndex % 2 === 0 ? 'bg-muted/15' : 'bg-white')}>
                <th
                  scope="row"
                  className="border-b border-border/50 px-3 py-3 text-left font-medium text-[#0f1f3d]"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <ChevronRight
                      className="size-3.5 shrink-0 text-muted-foreground/70"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    {row.label}
                  </span>
                </th>
                {otherColumns.map((column) => {
                  const value = column.values[row.id];
                  return (
                    <td
                      key={`${column.modelLabel}-${row.id}`}
                      className="border-b border-border/50 px-3 py-3 text-center text-[#0f1f3d]"
                    >
                      <ComparisonCellValue value={value} />
                    </td>
                  );
                })}
                <td
                  className={cn(
                    'border-b border-red-600/15 bg-red-50/90 px-3 py-3 text-center font-medium text-[#0f1f3d]',
                    rowIndex === 0 && 'border-t border-red-600/20',
                  )}
                >
                  <ComparisonCellValue
                    value={currentColumn.values[row.id]}
                    emphasize={row.id === 'volume'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-right">
        <Link
          to="/tienda?buscar=ricoh+im"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#0f1f3d] underline-offset-2 hover:text-red-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
        >
          Ver comparación completa
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      </p>
    </section>
  );
}
