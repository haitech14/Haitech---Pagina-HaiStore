import { Headset, Link2, RefreshCw, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  useHaiSalesStatus,
  useHaiSalesSyncDatabase,
  useHaiSalesSyncSeeds,
} from '@/hooks/use-haisales-integration';
import {
  useHaiSupportStatus,
  useHaiSupportSync,
  useIntegrationsSyncAll,
} from '@/hooks/use-haisupport-integration';
import { useIntegrationsHealth } from '@/hooks/use-integrations-health';
import { cn } from '@/lib/utils';
import type { IntegrationConnectionStatus } from '@/types/integrations-health';

function ConnectionBadge({ connected, configured }: { connected: boolean; configured: boolean }) {
  if (!configured) {
    return (
      <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
        Sin configurar
      </span>
    );
  }
  if (connected) {
    return (
      <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
        Conectado
      </span>
    );
  }
  return (
    <span className="rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-800">
      Desconectado
    </span>
  );
}

function formatMode(connection: IntegrationConnectionStatus | undefined): string {
  if (!connection?.mode || connection.mode === 'none') return '—';
  const labels: Record<string, string> = {
    'supabase-bridge': 'Supabase bridge',
    'shared-supabase': 'Supabase compartido',
    'supabase-mirror': 'Espejo Supabase',
    'rest-api': 'API REST',
    supabase: 'Supabase',
  };
  return labels[connection.mode] ?? connection.mode;
}

function Stat({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
        {value == null ? '—' : value}
      </p>
    </div>
  );
}

export function IntegrationsPanel() {
  const health = useIntegrationsHealth();
  const haiSupportStatus = useHaiSupportStatus();
  const haiSalesStatus = useHaiSalesStatus();
  const syncHaiSupport = useHaiSupportSync();
  const syncHaiSalesDb = useHaiSalesSyncDatabase();
  const syncHaiSalesSeeds = useHaiSalesSyncSeeds();
  const syncAll = useIntegrationsSyncAll();

  const hs = health.data?.haisupport ?? haiSupportStatus.data?.connection;
  const hl = health.data?.haisales ?? haiSalesStatus.data?.connection;
  const busy =
    syncHaiSupport.isPending ||
    syncHaiSalesDb.isPending ||
    syncHaiSalesSeeds.isPending ||
    syncAll.isPending;

  const handleSyncHaiSupport = () => {
    void syncHaiSupport
      .mutateAsync()
      .then((result) => {
        const { customers } = result;
        toast.success(
          `HaiSupport: ${customers.pulled} leídos, ${customers.updated} actualizados, ${customers.linked} vinculados.`,
        );
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'No se pudo sincronizar HaiSupport');
      });
  };

  const handleSyncHaiSales = () => {
    void syncHaiSalesDb
      .mutateAsync({})
      .then((result) => {
        const { persona, ventas } = result.database;
        toast.success(
          `HaiSales: ${persona.created + persona.updated} clientes, ${ventas.created + ventas.updated} comprobantes.`,
        );
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'No se pudo sincronizar HaiSales');
      });
  };

  const handleSyncSeeds = () => {
    void syncHaiSalesSeeds
      .mutateAsync()
      .then((result) => {
        const { persona, ventas } = result.database;
        toast.success(
          `Excel → HaiSales: ${persona.created + persona.updated} clientes, ${ventas.created + ventas.updated} comprobantes.`,
        );
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'No se pudo importar Excel HaiSales');
      });
  };

  const handleSyncAll = () => {
    void syncAll
      .mutateAsync({})
      .then(() => {
        toast.success('HaiSales y HaiSupport sincronizados.');
        void health.refetch();
        void haiSupportStatus.refetch();
        void haiSalesStatus.refetch();
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'No se pudo sincronizar');
      });
  };

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <section className="rounded-xl border p-4">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link2 className="size-4 shrink-0 text-red-600" aria-hidden="true" />
            <div>
              <h3 className="text-base font-semibold">Integraciones Haitech</h3>
              <p className="text-sm text-muted-foreground">
                Estado de conexión con HaiSales (ERP) y HaiSupport (soporte / alquileres).
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-9 gap-2"
            disabled={busy}
            onClick={handleSyncAll}
          >
            <RefreshCw className={cn('size-4', syncAll.isPending && 'animate-spin')} aria-hidden="true" />
            {syncAll.isPending ? 'Sincronizando…' : 'Sincronizar todo'}
          </Button>
        </div>

        {health.data?.auth && (
          <p className="text-xs text-muted-foreground">
            Auth unificado:{' '}
            <span className={health.data.auth.unified ? 'text-emerald-700' : 'text-amber-700'}>
              {health.data.auth.unified ? 'activo' : 'revisar avisos'}
            </span>
            {health.data.auth.warnings.length > 0
              ? ` — ${health.data.auth.warnings.join('; ')}`
              : null}
          </p>
        )}
      </section>

      <section className="rounded-xl border p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Headset className="size-4 shrink-0 text-red-600" aria-hidden="true" />
            <h3 className="text-base font-semibold">HaiSupport</h3>
            <ConnectionBadge
              configured={hs?.configured ?? false}
              connected={hs?.connected ?? false}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-9 gap-2"
            disabled={busy || !hs?.connected}
            onClick={handleSyncHaiSupport}
          >
            <RefreshCw
              className={cn('size-4', syncHaiSupport.isPending && 'animate-spin')}
              aria-hidden="true"
            />
            {syncHaiSupport.isPending ? 'Sincronizando…' : 'Sincronizar clientes'}
          </Button>
        </div>

        <div className="mb-3 grid gap-2 text-sm sm:grid-cols-2">
          <p>
            <span className="text-muted-foreground">Modo: </span>
            {formatMode(hs)}
          </p>
          <p className="truncate">
            <span className="text-muted-foreground">URL: </span>
            {hs?.url ?? '—'}
          </p>
          {haiSupportStatus.data && (
            <>
              <p>
                <span className="text-muted-foreground">Sync outbound: </span>
                {haiSupportStatus.data.outboundSync ? 'activo' : 'off'}
              </p>
              <p>
                <span className="text-muted-foreground">Webhook: </span>
                {haiSupportStatus.data.webhookConfigured ? 'configurado' : 'sin secreto'}
              </p>
            </>
          )}
        </div>

        {haiSupportStatus.data?.counts && (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Clientes tienda" value={haiSupportStatus.data.counts.storeCustomers} />
            <Stat label="Clientes HaiSupport" value={haiSupportStatus.data.counts.haisupportClients} />
            <Stat label="Servicios" value={haiSupportStatus.data.counts.serviceRequests} />
            <Stat label="Alquileres" value={haiSupportStatus.data.counts.rentalRequests} />
          </div>
        )}

        {(hs?.error || haiSupportStatus.isError) && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {hs?.error ?? 'No se pudo cargar el estado de HaiSupport.'}
          </p>
        )}

        {haiSupportStatus.data?.migrations && haiSupportStatus.data.migrations.length > 0 && (
          <p className="mt-3 text-sm text-amber-800">
            Migraciones pendientes: {haiSupportStatus.data.migrations.join(', ')}. También hace falta{' '}
            <code className="rounded bg-muted px-1 text-xs">store_customers</code> (
            <code className="rounded bg-muted px-1 text-xs">npm run db:migrate:customers</code>).
          </p>
        )}
      </section>

      <section className="rounded-xl border p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-4 shrink-0 text-red-600" aria-hidden="true" />
            <h3 className="text-base font-semibold">HaiSales</h3>
            <ConnectionBadge
              configured={hl?.configured ?? false}
              connected={hl?.connected ?? false}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-9 gap-2"
              disabled={busy || !hl?.connected}
              onClick={handleSyncHaiSales}
            >
              <RefreshCw
                className={cn('size-4', syncHaiSalesDb.isPending && 'animate-spin')}
                aria-hidden="true"
              />
              {syncHaiSalesDb.isPending ? 'Sincronizando…' : 'Sincronizar base'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-9 gap-2"
              disabled={busy || !hl?.configured}
              onClick={handleSyncSeeds}
            >
              <RefreshCw
                className={cn('size-4', syncHaiSalesSeeds.isPending && 'animate-spin')}
                aria-hidden="true"
              />
              {syncHaiSalesSeeds.isPending ? 'Importando…' : 'Excel → base'}
            </Button>
          </div>
        </div>

        <div className="mb-3 grid gap-2 text-sm sm:grid-cols-2">
          <p>
            <span className="text-muted-foreground">Modo: </span>
            {formatMode(hl)}
          </p>
          <p className="truncate">
            <span className="text-muted-foreground">URL: </span>
            {hl?.url ?? '—'}
          </p>
          {haiSalesStatus.data?.haisalesDatabase && (
            <>
              <p>
                <span className="text-muted-foreground">Espejo Persona: </span>
                {haiSalesStatus.data.haisalesDatabase.mirrorPersona ?? '—'}
              </p>
              <p>
                <span className="text-muted-foreground">Espejo Ventas: </span>
                {haiSalesStatus.data.haisalesDatabase.mirrorVentas ?? '—'}
              </p>
            </>
          )}
        </div>

        {haiSalesStatus.data && (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Clientes con Persona" value={haiSalesStatus.data.customers.withPersona} />
            <Stat label="Clientes totales" value={haiSalesStatus.data.customers.count} />
            <Stat label="Comprobantes" value={haiSalesStatus.data.ventas.count} />
            <Stat
              label="Última venta"
              value={
                haiSalesStatus.data.ventas.lastUpdated
                  ? new Date(haiSalesStatus.data.ventas.lastUpdated).toLocaleDateString('es-PE')
                  : null
              }
            />
          </div>
        )}

        {(hl?.error || haiSalesStatus.isError) && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {hl?.error ?? 'No se pudo cargar el estado de HaiSales.'}
          </p>
        )}

        {hl && !hl.connected && (
          <p className="mt-3 text-sm text-amber-800">
            Faltan tablas espejo. Aplica{' '}
            <code className="rounded bg-muted px-1 text-xs">011</code> y{' '}
            <code className="rounded bg-muted px-1 text-xs">012</code> (
            <code className="rounded bg-muted px-1 text-xs">npm run db:migrate:011</code>,{' '}
            <code className="rounded bg-muted px-1 text-xs">npm run db:migrate:012</code>) con{' '}
            <code className="rounded bg-muted px-1 text-xs">SUPABASE_ACCESS_TOKEN</code> o{' '}
            <code className="rounded bg-muted px-1 text-xs">SUPABASE_DB_URL</code>.
          </p>
        )}
      </section>
    </div>
  );
}
