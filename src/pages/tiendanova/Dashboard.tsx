import { CalendarDays } from 'lucide-react';

import { ActivityTimeline } from '@/components/tiendanova/ActivityTimeline';
import { MetricCard } from '@/components/tiendanova/MetricCard';
import { OrdersTable } from '@/components/tiendanova/OrdersTable';
import { ProductsList } from '@/components/tiendanova/ProductsList';
import { SalesChart } from '@/components/tiendanova/SalesChart';
import { StockAlert } from '@/components/tiendanova/StockAlert';
import { TIENDANOVA_HEADER, TIENDANOVA_METRICS } from '@/data/tiendanova/dashboard';

export function Dashboard() {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900 sm:text-[30px]">
            {TIENDANOVA_HEADER.greeting}
          </h1>
          <p className="mt-1 max-w-xl text-[14.5px] leading-relaxed text-slate-500">
            {TIENDANOVA_HEADER.subtitle}
          </p>
        </div>
        <p className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-400">
          <CalendarDays className="size-4" aria-hidden="true" />
          {TIENDANOVA_HEADER.dateLabel}
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores">
        {TIENDANOVA_METRICS.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
        <SalesChart />
        <ProductsList />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
        <OrdersTable />
        <div className="flex flex-col gap-4">
          <StockAlert />
          <ActivityTimeline />
        </div>
      </section>
    </div>
  );
}
