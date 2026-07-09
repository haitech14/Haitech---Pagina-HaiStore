import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useHaiSalesStatus } from '@/hooks/use-haisales-integration';
import { useIntegrationsSyncAll } from '@/hooks/use-haisupport-integration';
import { cn } from '@/lib/utils';

export function IntegrationsSyncAllCard() {
  const { data: haisalesStatus } = useHaiSalesStatus();
  const syncAll = useIntegrationsSyncAll();

  const mirrorRemote = haisalesStatus?.haisalesDatabase.remote ?? false;

  const handleSyncAll = async () => {
    try {
      const result = await syncAll.mutateAsync({ mirrorRemote });
      const parts: string[] = [];

      if (result.haisales?.database) {
        const { persona, ventas } = result.haisales.database;
        parts.push(
          `HaiSales: ${persona.created + persona.updated} clientes, ${ventas.created + ventas.updated} comprobantes`,
        );
      }
      if (result.haisupport?.customers) {
        const c = result.haisupport.customers;
        parts.push(
          `HaiSupport: ${c.pulled} importados, ${c.pushed} enviados`,
        );
      }

      toast.success(parts.join(' · ') || 'Sincronización completada');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'No se pudo sincronizar las integraciones',
      );
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[hsl(var(--admin-accent))]/40 bg-[hsl(var(--admin-accent))]/5 p-4">
      <div>
        <p className="font-semibold text-foreground">Sincronización unificada</p>
        <p className="text-xs text-muted-foreground">
          Ejecuta HaiSales (espejo → tienda) y HaiSupport (clientes bidireccional) en un solo paso.
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        className="min-h-10 gap-2"
        disabled={syncAll.isPending}
        onClick={() => void handleSyncAll()}
      >
        <RefreshCw className={cn('size-4', syncAll.isPending && 'animate-spin')} aria-hidden="true" />
        {syncAll.isPending ? 'Sincronizando todo…' : 'Sincronizar HaiSales + HaiSupport'}
      </Button>
    </div>
  );
}
