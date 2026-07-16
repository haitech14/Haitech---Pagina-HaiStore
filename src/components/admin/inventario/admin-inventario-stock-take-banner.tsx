import { useQuery } from '@tanstack/react-query';
import { ClipboardList, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';

export interface InventoryStockTakeLine {
  productId: string;
  name: string;
  previousStock: number;
  newStock: number;
  delta: number;
  warehouseId: string;
  warehouseName: string;
}

export interface InventoryStockTake {
  id: string;
  type: string;
  title: string;
  source?: string;
  warehouseId: string;
  warehouseName: string;
  takenAt: string;
  createdAt: string;
  grandTotal: number;
  lines: InventoryStockTakeLine[];
  notes?: string;
}

const DISMISS_STORAGE_PREFIX = 'admin-inventario-stock-take-banner-dismissed:';

function dismissStorageKey(takeId: string): string {
  return `${DISMISS_STORAGE_PREFIX}${takeId}`;
}

function isTakeDismissed(takeId: string): boolean {
  try {
    return window.localStorage.getItem(dismissStorageKey(takeId)) === '1';
  } catch {
    return false;
  }
}

function persistTakeDismissed(takeId: string): void {
  try {
    window.localStorage.setItem(dismissStorageKey(takeId), '1');
  } catch {
    // ignore quota / private mode
  }
}

async function fetchLatestStockTake(): Promise<InventoryStockTake | null> {
  try {
    return await apiFetch<InventoryStockTake | null>('/api/inventory/stock-takes/latest');
  } catch {
    return null;
  }
}

export function useLatestInventoryStockTake() {
  const { isAdmin } = useAuth();
  return useQuery({
    queryKey: ['inventory-stock-takes', 'latest'],
    queryFn: fetchLatestStockTake,
    enabled: isAdmin,
    staleTime: 1000 * 60,
  });
}

export function AdminInventarioStockTakeBanner({ className }: { className?: string }) {
  const { data: take } = useLatestInventoryStockTake();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!take?.id) {
      setDismissed(false);
      return;
    }
    setDismissed(isTakeDismissed(take.id));
  }, [take?.id]);

  if (!take || dismissed) return null;

  const handleDismiss = () => {
    persistTakeDismissed(take.id);
    setDismissed(true);
  };

  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-2.5 text-sm text-emerald-950',
        className,
      )}
      role="status"
    >
      <ClipboardList className="mt-0.5 size-4 shrink-0 text-emerald-700" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-snug">{take.title}</p>
        <p className="mt-0.5 text-xs text-emerald-900/80">
          Registro en {take.warehouseName} · {take.lines.length} equipos · total{' '}
          <span className="font-semibold tabular-nums">{take.grandTotal}</span>
          {take.takenAt ? ` · toma ${take.takenAt}` : null}
        </p>
        {take.notes ? (
          <p className="mt-1 text-[0.6875rem] leading-snug text-emerald-900/70">{take.notes}</p>
        ) : null}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 shrink-0 text-emerald-800/70 hover:bg-emerald-100 hover:text-emerald-950"
        aria-label="Cerrar aviso de toma de inventario"
        onClick={handleDismiss}
      >
        <X className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
