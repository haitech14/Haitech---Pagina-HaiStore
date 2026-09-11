import { Link } from 'react-router-dom';
import { ArrowRight, TriangleAlert } from 'lucide-react';

import { NovaCard } from '@/components/tiendanova/NovaCard';
import { TIENDANOVA_STOCK } from '@/data/tiendanova/dashboard';

export function StockAlert() {
  return (
    <NovaCard className="p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TriangleAlert className="size-4 text-[#EF4444]" aria-hidden="true" />
          <h2 className="text-[15px] font-semibold text-slate-800">Stock crítico</h2>
        </div>
        <Link
          to="/admin/inventario"
          className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#2563EB] transition hover:underline"
        >
          Ver inventario <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
      <ul className="space-y-3.5">
        {TIENDANOVA_STOCK.map((item) => (
          <li key={item.name} className="flex items-center gap-3">
            <img src={item.image} alt="" className="size-10 rounded-xl object-cover ring-1 ring-slate-100" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-semibold text-slate-800">{item.name}</p>
              <p className="text-[12.5px] font-semibold text-[#EF4444]">Solo {item.units} unidades</p>
            </div>
          </li>
        ))}
      </ul>
    </NovaCard>
  );
}
