import { Database, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  useHaiSalesStatus,
  useHaiSalesSyncDatabase,
  useHaiSalesSyncSeeds,
} from '@/hooks/use-haisales-integration';
import { ADMIN_ROUTES } from '@/lib/admin-routes';
import { cn } from '@/lib/utils';

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={cn(
        'inline-block size-2 shrink-0 rounded-full',
        ok ? 'bg-emerald-500' : 'bg-amber-500',
      )}
      aria-hidden="true"
    />
  );
}

function formatSyncToast(database: {
  persona: { created: number; updated: number };
  ventas: { created: number; updated: number };
}) {
  const p = database.persona.created + database.persona.updated;
  const v = database.ventas.created + database.ventas.updated;
  return `HaiSales: ${p} clientes y ${v} comprobantes sincronizados en HaiStore.`;
}

export function HaiSalesIntegrationCard() {
  const { data: status, isLoading, refetch } = useHaiSalesStatus();
  const syncSeeds = useHaiSalesSyncSeeds();
  const syncDatabase = useHaiSalesSyncDatabase();

  const busy = syncSeeds.isPending || syncDatabase.isPending;
  const dbReady =
    status?.supabaseConfigured &&
    !status.haisalesDatabase.migrationRequired &&
    !status.ventas.migrationRequired;

  const handleSyncSeeds = async () => {
    try {
      const result = await syncSeeds.mutateAsync();
      toast.success(formatSyncToast(result.database));
      const errors = [
        ...result.database.persona.errors,
        ...result.database.ventas.errors,
      ];
      if (errors.length > 0) console.warn('[haisales-sync-seeds]', errors);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo sincronizar HaiSales');
    }
  };

  const handleSyncDatabase = async () => {
    try {
      const result = await syncDatabase.mutateAsync(
        status?.haisalesDatabase.remote ? { mirrorRemote: true } : {},
      );
      toast.success(formatSyncToast(result.database));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'No se pudo sincronizar la base HaiSales',
      );
    }
  };

  return (
    <div className="rounded-lg border border-[hsl(var(--admin-accent))]/25 bg-muted/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet
            className="size-5 text-[hsl(var(--admin-accent))]"
            aria-hidden="true"
          />
          <div>
            <h4 className="font-semibold text-foreground">HaiSales (ERP)</h4>
            <p className="text-xs text-muted-foreground">
              Base espejo Supabase → clientes y ventas en HaiStore
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-10 gap-2"
            disabled={busy || isLoading || !dbReady}
            onClick={() => void handleSyncDatabase()}
          >
            <Database className={cn('size-4', syncDatabase.isPending && 'animate-spin')} aria-hidden="true" />
            {syncDatabase.isPending ? 'Sincronizando…' : 'Sincronizar base'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-10 gap-2"
            disabled={busy || isLoading || status?.supabaseConfigured === false}
            onClick={() => void handleSyncSeeds()}
          >
            <RefreshCw className={cn('size-4', syncSeeds.isPending && 'animate-spin')} aria-hidden="true" />
            {syncSeeds.isPending ? 'Importando…' : 'Excel → base'}
          </Button>
        </div>
      </div>

      {isLoading && (
        <p className="mt-3 text-sm text-muted-foreground" role="status">
          Comprobando integración…
        </p>
      )}

      {status && (
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <StatusDot ok={status.connection?.connected ?? false} />
            API HaiSales:{' '}
            {status.connection?.connected
              ? `conectado (${status.connection.mode})`
              : status.configured
                ? 'configurado, sin respuesta'
                : 'no configurado'}
          </li>
          <li className="flex items-center gap-2">
            <StatusDot ok={status.haisalesDatabase.configured} />
            <Database className="size-4 shrink-0" aria-hidden="true" />
            Base HaiSales:{' '}
            {status.haisalesDatabase.migrationRequired
              ? 'requiere migración 012'
              : `${status.haisalesDatabase.mirrorPersona ?? 0} personas, ${status.haisalesDatabase.mirrorVentas ?? 0} comprobantes`}
            {status.haisalesDatabase.remote ? ' (proyecto remoto)' : ' (mismo Supabase)'}
          </li>
          <li className="flex items-center gap-2">
            <StatusDot ok={!status.ventas.migrationRequired} />
            Histórico en tienda:{' '}
            {status.ventas.migrationRequired
              ? 'requiere migración 011'
              : `${status.ventas.count ?? 0} comprobantes`}
          </li>
          <li>
            Clientes HaiStore: {status.customers.withPersona ?? 0} con Persona /{' '}
            {status.customers.count ?? 0} total
          </li>
          <li>
            Semillas Excel: {status.seeds.personaFiles.length} Persona,{' '}
            {status.seeds.ventasFiles.length} Ventas
          </li>
          {(status.migrations?.length ?? 0) > 0 && (
            <li className="text-xs">
              Migraciones pendientes:{' '}
              {status.migrations.map((m) => (
                <code key={m} className="mr-1 rounded bg-muted px-1">
                  {m}
                </code>
              ))}
            </li>
          )}
        </ul>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        <strong>Sincronizar base</strong> lee{' '}
        <code className="text-xs">haisales_persona</code> y <code className="text-xs">haisales_ventas</code>.
        <strong> Excel → base</strong> importa desde <code className="text-xs">data/seeds</code> y luego sincroniza.
        Ver también{' '}
        <Link
          to={ADMIN_ROUTES.VENTAS}
          className="font-medium text-[hsl(var(--admin-accent))] underline-offset-2 hover:underline"
        >
          Ventas
        </Link>
        .{' '}
        <button
          type="button"
          className="text-foreground underline-offset-2 hover:underline"
          onClick={() => void refetch()}
        >
          Actualizar estado
        </button>
      </p>
    </div>
  );
}
