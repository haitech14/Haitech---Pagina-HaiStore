import { useParams } from 'react-router-dom';

import { NovaCard } from '@/components/tiendanova/NovaCard';
import { TIENDANOVA_NAV } from '@/data/tiendanova/dashboard';

export function PlaceholderPage() {
  const { section } = useParams();
  const item = TIENDANOVA_NAV.find((nav) => nav.href.endsWith(`/${section}`));
  const title = item?.label ?? 'Módulo';

  return (
    <div className="mx-auto max-w-[1400px]">
      <h1 className="text-[28px] font-bold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">Módulo listo para conectar con datos reales.</p>
      <NovaCard className="mt-6 p-8">
        <p className="text-sm leading-relaxed text-slate-500">
          Esta vista de <span className="font-semibold text-slate-700">{title}</span> comparte el
          layout de TiendaNova. El dashboard principal con métricas, gráfico y tablas está en{' '}
          <span className="font-semibold text-slate-700">Dashboard</span>.
        </p>
      </NovaCard>
    </div>
  );
}
