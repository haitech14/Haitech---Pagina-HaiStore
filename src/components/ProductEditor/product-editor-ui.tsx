import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type ProductEditorTabId =
  | 'informacion'
  | 'precios'
  | 'inventario'
  | 'atributos'
  | 'multimedia'
  | 'relaciones';

export interface ProductEditorCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function ProductEditorCard({
  title,
  description,
  icon,
  action,
  className,
  children,
}: ProductEditorCardProps) {
  return (
    <section
      className={cn(
        'rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
        className,
      )}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          {icon ? (
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#F8FAFC] text-[#6B7280]">
              {icon}
            </span>
          ) : null}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[#111827]">{title}</h3>
            {description ? (
              <p className="mt-0.5 text-xs leading-snug text-[#6B7280]">{description}</p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      {children}
    </section>
  );
}

export const PRODUCT_EDITOR_LABEL_CLASS =
  'mb-1.5 block text-[11px] font-medium text-[#6B7280]';

export const PRODUCT_EDITOR_INPUT_CLASS =
  'h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] shadow-none outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#EF233C]/50 focus:ring-2 focus:ring-[#EF233C]/15';

export const PRODUCT_EDITOR_SELECT_CLASS = PRODUCT_EDITOR_INPUT_CLASS;
