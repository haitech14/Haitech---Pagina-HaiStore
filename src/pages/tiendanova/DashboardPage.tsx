import { useEffect, useState } from 'react';

import { Dashboard } from '@/pages/tiendanova/Dashboard';
import { novaCardClass } from '@/components/tiendanova/NovaCard';
import { cn } from '@/lib/utils';

function Pulse({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-slate-200/80', className)} />;
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6" aria-busy="true" aria-label="Cargando dashboard">
      <div className="space-y-3">
        <Pulse className="h-8 w-64" />
        <Pulse className="h-4 w-80" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={cn(novaCardClass, 'p-5')}>
            <Pulse className="h-3 w-24" />
            <Pulse className="mt-4 h-8 w-28" />
            <Pulse className="mt-4 h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
        <div className={cn(novaCardClass, 'h-[340px] p-5')}>
          <Pulse className="h-4 w-48" />
          <Pulse className="mt-6 h-[240px] w-full" />
        </div>
        <div className={cn(novaCardClass, 'h-[340px] p-5')}>
          <Pulse className="h-4 w-40" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Pulse key={index} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 450);
    return () => window.clearTimeout(timer);
  }, []);

  if (!ready) return <DashboardSkeleton />;
  return <Dashboard />;
}
