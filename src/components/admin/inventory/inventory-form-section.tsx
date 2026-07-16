import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface InventoryFormSectionProps {
  id?: string;
  title: string;
  /** Optional section number shown before the title (e.g. 1 → "1. Título"). */
  number?: number;
  description?: string;
  icon?: LucideIcon;
  /** Acción a la derecha del título (p. ej. «Editar» que cambia de pestaña). */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function InventoryFormSection({
  id,
  title,
  number,
  description,
  icon: Icon,
  actions,
  children,
  className,
  contentClassName,
}: InventoryFormSectionProps) {
  return (
    <section id={id} className={cn(className)}>
      <div
        className={cn(
          'rounded-md border border-border/70 bg-card p-4 shadow-sm',
          contentClassName,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h3 className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
              {Icon ? (
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
              ) : null}
              <span>
                {number != null ? (
                  <span className="tabular-nums text-slate-500">{number}. </span>
                ) : null}
                {title}
              </span>
            </h3>
            {description ? (
              <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
        {children}
      </div>
    </section>
  );
}
