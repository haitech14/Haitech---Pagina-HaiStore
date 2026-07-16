import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useHaiSalesSyncSeeds } from '@/hooks/use-haisales-integration';
import type { HaiSalesSyncSeedsResult } from '@/types/haisales-integration';
import { cn } from '@/lib/utils';

function formatHaiSalesSyncToast(result: HaiSalesSyncSeedsResult): string {
  const { database } = result;
  const clients = database.persona.created + database.persona.updated;
  const comprobantes = database.ventas.created + database.ventas.updated;
  const skipped = database.persona.skipped + database.ventas.skipped;
  const errors =
    database.persona.errors.length +
    database.ventas.errors.length;

  const parts = [`HaiSales sincronizado: ${clients} clientes, ${comprobantes} comprobantes.`];
  if (skipped > 0) parts.push(`${skipped} omitidos.`);
  if (errors > 0) parts.push(`${errors} errores (revisa consola).`);
  return parts.join(' ');
}

interface HaiSalesSyncButtonProps {
  variant?: 'outline' | 'default' | 'ghost';
  className?: string;
  size?: 'default' | 'sm' | 'icon';
}

export function HaiSalesSyncButton({
  variant = 'outline',
  className,
  size = 'default',
}: HaiSalesSyncButtonProps) {
  const syncHaiSales = useHaiSalesSyncSeeds();

  const handleSync = () => {
    void syncHaiSales
      .mutateAsync()
      .then((result) => {
        toast.success(formatHaiSalesSyncToast(result));
        if (
          result.database.persona.errors.length > 0 ||
          result.database.ventas.errors.length > 0
        ) {
          console.warn('[haisales-sync]', result.database);
        }
      })
      .catch((error) => {
        toast.error(
          error instanceof Error ? error.message : 'No se pudo sincronizar HaiSales',
        );
      });
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn('min-h-11 gap-2', size === 'sm' && 'min-h-8', className)}
      disabled={syncHaiSales.isPending}
      onClick={handleSync}
    >
      <RefreshCw
        className={cn('size-4', syncHaiSales.isPending && 'animate-spin')}
        aria-hidden="true"
      />
      {syncHaiSales.isPending ? 'Sincronizando…' : 'Sincronizar HaiSales'}
    </Button>
  );
}
