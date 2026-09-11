import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export const novaCardClass =
  'rounded-2xl border border-slate-100/90 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.045)]';

export function NovaCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <section className={cn(novaCardClass, className)}>{children}</section>;
}
