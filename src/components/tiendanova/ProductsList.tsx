import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { NovaCard } from '@/components/tiendanova/NovaCard';
import { TIENDANOVA_TOP_PRODUCTS } from '@/data/tiendanova/dashboard';

export function ProductsList() {
  return (
    <NovaCard className="p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-slate-800">🏆 Productos más vendidos</h2>
        <Link
          to="/admin/inventario"
          className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#2563EB] transition hover:underline"
        >
          Ver todos <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
      <ol className="space-y-3.5">
        {TIENDANOVA_TOP_PRODUCTS.map((product) => (
          <li key={product.rank} className="flex items-center gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-500">
              {product.rank}
            </span>
            <img
              src={product.image}
              alt=""
              className="size-11 rounded-xl object-cover ring-1 ring-slate-100"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-semibold text-slate-800">{product.name}</p>
              <p className="text-[12px] text-slate-400">{product.sales} ventas</p>
            </div>
            <p className="shrink-0 text-[13.5px] font-bold text-slate-800">{product.price}</p>
          </li>
        ))}
      </ol>
    </NovaCard>
  );
}
