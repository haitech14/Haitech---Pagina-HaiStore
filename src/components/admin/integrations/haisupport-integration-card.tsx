import { Database, Headset, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useHaiSupportStatus, useHaiSupportSync } from '@/hooks/use-haisupport-integration';
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

function formatSyncToast(result: {
  customers: { pulled: number; updated: number; pushed: number; linked: number };
}) {
  const { pulled, updated, pushed, linked } = result.customers;
  return `HaiSupport: ${pulled} importados, ${updated} actualizados, ${pushed} enviados (${linked} vinculados).`;
}

export function HaiSupportIntegrationCard() {
  const { data: status, isLoading, refetch } = useHaiSupportStatus();
  const sync = useHaiSupportSync();

  const bridgeReady = status?.bridge.configured && status.sharedSupabase;
  const canSync = bridgeReady && !sync.isPending && !isLoading;

  const handleSync = async () => {
    try {
      const result = await sync.mutateAsync();
      toast.success(formatSyncToast(result));
      const errors = result.customers.errors;
      if (errors.length > 0) console.warn('[haisupport-sync]', errors);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo sincronizar HaiSupport');
    }
  };

  return (
    <div className="rounded-lg border border-[hsl(var(--admin-accent))]/25 bg-muted/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Headset className="size-5 text-[hsl(var(--admin-accent))]" aria-hidden="true" />
          <div>
            <h4 className="font-semibold text-foreground">HaiSupport</h4>
            <p className="text-xs text-muted-foreground">
              Soporte, servicios y alquileres — Supabase compartido + bridge clientes
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-10 gap-2"
          disabled={!canSync}
          onClick={() => void handleSync()}
        >
          <RefreshCw className={cn('size-4', sync.isPending && 'animate-spin')} aria-hidden="true" />
          {sync.isPending ? 'Sincronizando…' : 'Sincronizar clientes'}
        </Button>
      </div>

      {isLoading && (
        <p className="mt-3 text-sm text-muted-foreground" role="status">
          Comprobando integración…
        </p>
      )}

      {status && (
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <StatusDot ok={status.sharedSupabase} />
            <Database className="size-4 shrink-0" aria-hidden="true" />
            Supabase compartido: {status.sharedSupabase ? 'activo' : 'no configurado'}
            {status.bridge.sameProject ? ' (mismo proyecto)' : ''}
          </li>
          <li className="flex items-center gap-2">
            <StatusDot ok={status.outboundSync} />
            Sync outbound: {status.outboundSync ? 'habilitado' : 'deshabilitado'}
          </li>
          <li className="flex items-center gap-2">
            <StatusDot ok={status.webhookConfigured} />
            Webhook inbound: {status.webhookConfigured ? 'configurado' : 'sin secreto'}
          </li>
          <li>
            Clientes: {status.counts.storeCustomers ?? 0} en tienda
            {status.counts.linkedCustomers != null
              ? ` · ${status.counts.linkedCustomers} vinculados`
              : ''}
            {status.counts.haisupportClients != null
              ? ` · ${status.counts.haisupportClients} en HaiSupport`
              : ''}
          </li>
          <li>
            Entidades compartidas: {status.counts.serviceRequests ?? 0} servicios,{' '}
            {status.counts.rentalRequests ?? 0} alquileres, {status.counts.orders ?? 0} pedidos
          </li>
          {!status.bridge.clientsTableAvailable && status.bridge.configured && (
            <li className="text-xs text-amber-700">
              Tabla <code className="text-xs">clients</code> no detectada — sync de clientes vía
              tablas <code className="text-xs">store_*</code> compartidas.
            </li>
          )}
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
        Productos, pedidos y proformas se sincronizan en tiempo real vía Supabase Realtime.{' '}
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
