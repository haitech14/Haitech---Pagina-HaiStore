import { toast } from 'sonner';

export interface SyncCatalogApiResult {
  ok: boolean;
  total: number;
  fromCatalog: number;
  custom?: number;
  resetDeleted?: boolean;
  supabaseSynced?: boolean;
  snapshotsUpdated?: {
    homeBundle?: boolean;
    inventoryIndex?: boolean;
  };
}

export function describeSyncCatalogSuccess(result: SyncCatalogApiResult): string {
  const parts: string[] = [];

  parts.push(
    `${result.total} producto${result.total === 1 ? '' : 's'} en inventario` +
      (result.fromCatalog > 0
        ? ` (${result.fromCatalog} alineado${result.fromCatalog === 1 ? '' : 's'} con catálogo maestro)`
        : ''),
  );

  const snapshots = result.snapshotsUpdated;
  if (snapshots?.inventoryIndex || snapshots?.homeBundle) {
    const snapshotLabels: string[] = [];
    if (snapshots.inventoryIndex) snapshotLabels.push('índice de catálogo');
    if (snapshots.homeBundle) snapshotLabels.push('home bundle');
    if (snapshotLabels.length > 0) {
      parts.push(`snapshots: ${snapshotLabels.join(' y ')}`);
    }
  }

  if (result.supabaseSynced) {
    parts.push('Supabase actualizado');
  }

  return `Sincronización completada: ${parts.join(' · ')}.`;
}

export function toastSyncCatalogSuccess(result: SyncCatalogApiResult): void {
  toast.success(describeSyncCatalogSuccess(result));
}

export function toastSyncCatalogError(error: unknown): void {
  toast.error(
    error instanceof Error ? error.message : 'No se pudo sincronizar el catálogo con la tienda.',
  );
}
