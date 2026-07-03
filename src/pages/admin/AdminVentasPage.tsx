import { ArrowLeft } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import { AdminPedidosDashboard } from '@/components/admin/pedidos/admin-pedidos-dashboard';
import { AdminVentasUnifiedPanel } from '@/components/admin/sales/admin-ventas-unified-panel';
import { TpvPanel } from '@/components/admin/tpv/tpv-panel';
import { Button } from '@/components/ui/button';
import { ADMIN_ROUTES } from '@/lib/admin-routes';

function isTpvView(searchParams: URLSearchParams) {
  return searchParams.get('vista') === 'tpv' || searchParams.get('nuevo') === '1';
}

function resolveListTypeFilter(
  searchParams: URLSearchParams,
): 'all' | 'venta' | 'cotizacion' | 'historico' {
  const origen = searchParams.get('origen');
  if (origen === 'cotizacion' || origen === 'cotizaciones') return 'cotizacion';
  if (origen === 'historico' || origen === 'haisales') return 'historico';
  if (origen === 'venta' || origen === 'tienda') return 'venta';
  return 'all';
}

function isLegacyListView(searchParams: URLSearchParams) {
  const vista = searchParams.get('vista');
  return (
    vista === 'listado' ||
    vista === 'historico' ||
    vista === 'cotizaciones' ||
    vista === 'devoluciones' ||
    searchParams.has('origen')
  );
}

export function AdminVentasPage() {
  const [searchParams] = useSearchParams();

  if (isTpvView(searchParams)) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" className="min-h-11 gap-2" asChild>
            <Link to={ADMIN_ROUTES.VENTAS}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Volver a pedidos
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Punto de venta — emite cotización, factura o boleta en PDF. Las cotizaciones quedan
            registradas para seguimiento.
          </p>
        </div>
        <TpvPanel />
      </div>
    );
  }

  if (isLegacyListView(searchParams)) {
    const vista = searchParams.get('vista');

    if (vista === 'devoluciones') {
      return (
        <div className="space-y-4">
          <Button type="button" variant="outline" className="min-h-11 gap-2" asChild>
            <Link to={ADMIN_ROUTES.VENTAS}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Volver a pedidos
            </Link>
          </Button>
          <div className="rounded-xl border border-dashed bg-card px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-foreground">Devoluciones</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              El flujo de devoluciones estará disponible pronto. Mientras tanto, gestiona pedidos
              cancelados desde la pestaña correspondiente.
            </p>
            <Button type="button" className="mt-6" asChild>
              <Link to={ADMIN_ROUTES.VENTAS}>Ir a pedidos</Link>
            </Button>
          </div>
        </div>
      );
    }

    const defaultTypeFilter =
      vista === 'cotizaciones'
        ? 'cotizacion'
        : vista === 'historico'
          ? 'historico'
          : resolveListTypeFilter(searchParams);

    return <AdminVentasUnifiedPanel defaultTypeFilter={defaultTypeFilter} />;
  }

  return <AdminPedidosDashboard />;
}
