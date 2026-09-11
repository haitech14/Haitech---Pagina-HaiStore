import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Star, UserPlus } from 'lucide-react';

import { NovaCard } from '@/components/tiendanova/NovaCard';
import { TIENDANOVA_ACTIVITY, type ActivityKind } from '@/data/tiendanova/dashboard';
import { cn } from '@/lib/utils';

const KIND: Record<ActivityKind, { icon: typeof ShoppingCart; className: string }> = {
  order: { icon: ShoppingCart, className: 'bg-blue-50 text-[#2563EB]' },
  customer: { icon: UserPlus, className: 'bg-violet-50 text-violet-600' },
  stock: { icon: Package, className: 'bg-amber-50 text-[#F59E0B]' },
  review: { icon: Star, className: 'bg-emerald-50 text-[#16A34A]' },
};

export function ActivityTimeline() {
  return (
    <NovaCard className="p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-slate-800">Actividad reciente</h2>
        <Link to="/admin" className="text-[12.5px] font-semibold text-[#2563EB] hover:underline">
          Ver toda la actividad
        </Link>
      </div>
      <ol className="space-y-4">
        {TIENDANOVA_ACTIVITY.map((item) => {
          const meta = KIND[item.kind];
          const Icon = meta.icon;
          return (
            <li key={item.id} className="flex items-start gap-3">
              <span className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full', meta.className)}>
                <Icon className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-medium leading-snug text-slate-700">{item.title}</p>
                <p className="mt-0.5 text-[12px] text-slate-400">{item.time}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </NovaCard>
  );
}
