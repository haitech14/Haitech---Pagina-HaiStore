import { ArrowLeft, Plus } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import { AdminModuleLayout } from '@/components/admin/admin-module-layout';
import { ProformasListPanel } from '@/components/admin/sales/proformas-list-panel';
import { SalesListPanel } from '@/components/admin/sales/sales-list-panel';
import { TpvPanel } from '@/components/admin/tpv/tpv-panel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAdminOrdersList } from '@/hooks/use-admin-orders';
import { useAdminProformas } from '@/hooks/use-admin-proformas';
import { ADMIN_ROUTES } from '@/lib/admin-routes';

type VentasTab = 'ventas' | 'proformas';

function isTpvView(searchParams: URLSearchParams) {
  return searchParams.get('vista') === 'tpv' || searchParams.get('nuevo') === '1';
}

function parseTab(searchParams: URLSearchParams): VentasTab {
  return searchParams.get('tab') === 'proformas' ? 'proformas' : 'ventas';
}

export function AdminVentasPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const showTpv = isTpvView(searchParams);
  const tab = parseTab(searchParams);
  const { data: orders = [], isLoading: ordersLoading } = useAdminOrdersList();
  const { data: proformas = [], isLoading: proformasLoading } = useAdminProformas();

  const setTab = (next: VentasTab) => {
    setSearchParams(next === 'proformas' ? { tab: 'proformas' } : {});
  };

  if (showTpv) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" className="min-h-11 gap-2" asChild>
            <Link to={ADMIN_ROUTES.VENTAS}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Volver al listado
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Punto de venta — emite proforma, factura o boleta en PDF. Las proformas quedan
            registradas para seguimiento.
          </p>
        </div>
        <TpvPanel />
      </div>
    );
  }

  return (
    <AdminModuleLayout
      title="Ventas"
      description="Ventas registradas y proformas para seguimiento comercial con clientes."
    >
      <div
        className="flex gap-1 rounded-lg border bg-muted/30 p-1 sm:inline-flex"
        role="tablist"
        aria-label="Sección de ventas"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'ventas'}
          className={cn(
            'min-h-10 flex-1 rounded-md px-4 text-sm font-medium transition-colors sm:flex-none',
            tab === 'ventas'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
          onClick={() => setTab('ventas')}
        >
          Ventas ({ordersLoading ? '…' : orders.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'proformas'}
          className={cn(
            'min-h-10 flex-1 rounded-md px-4 text-sm font-medium transition-colors sm:flex-none',
            tab === 'proformas'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
          onClick={() => setTab('proformas')}
        >
          Proformas ({proformasLoading ? '…' : proformas.length})
        </button>
      </div>

      {tab === 'ventas' ? (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {ordersLoading
                ? 'Cargando ventas…'
                : `${orders.length} venta${orders.length === 1 ? '' : 's'} registrada${orders.length === 1 ? '' : 's'}`}
            </p>
            <Button
              asChild
              className="min-h-11 gap-2 bg-red-600 hover:bg-red-500 focus-visible:ring-red-600"
            >
              <Link to={ADMIN_ROUTES.TPV}>
                <Plus className="size-4" aria-hidden="true" />
                Nuevo
              </Link>
            </Button>
          </div>
          <SalesListPanel orders={orders} isLoading={ordersLoading} />
        </>
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Proformas para seguimiento: vendedor asignado, filtros y acciones por fila.
            </p>
            <Button
              asChild
              variant="outline"
              className="min-h-11 gap-2"
            >
              <Link to={ADMIN_ROUTES.TPV}>
                <Plus className="size-4" aria-hidden="true" />
                Nueva proforma (TPV)
              </Link>
            </Button>
          </div>
          <ProformasListPanel isLoading={proformasLoading} />
        </>
      )}
    </AdminModuleLayout>
  );
}
