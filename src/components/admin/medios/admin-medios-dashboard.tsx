import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { AdminMediosKpis } from '@/components/admin/medios/admin-medios-kpis';
import { AdminMediosPageHeader } from '@/components/admin/medios/admin-medios-page-header';
import { AdminMediosTablePanel } from '@/components/admin/medios/admin-medios-table-panel';
import { AdminMediosWidgets } from '@/components/admin/medios/admin-medios-widgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminSidebar } from '@/context/admin-sidebar-context';
import {
  useMediaAlbum,
  useMediaAlbumDriveConfig,
  useMediaAlbumMutations,
} from '@/hooks/use-media-album';
import { buildMediosKpis, dedupeMediosForDisplay } from '@/lib/admin-medios-utils';
import { readImageFile, readVideoFile } from '@/lib/inventory-product';
import { cn } from '@/lib/utils';
import type { MediaAlbumItem } from '@/types/media-album';

export function AdminMediosDashboard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [folderUrl, setFolderUrl] = useState('');
  const [updatedAt, setUpdatedAt] = useState(() => new Date());
  const { open: sidebarOpen } = useAdminSidebar();

  const { data: items = [], isLoading, refetch } = useMediaAlbum();
  const displayItems = useMemo(() => dedupeMediosForDisplay(items), [items]);
  const { data: driveConfig } = useMediaAlbumDriveConfig();
  const { upload, remove, updateDriveConfig, syncDrive } = useMediaAlbumMutations();

  const kpis = buildMediosKpis(displayItems);
  const busy = upload.isPending || remove.isPending || updateDriveConfig.isPending || syncDrive.isPending;

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      for (const file of [...files]) {
        const readAsDataUrl = file.type.startsWith('video/') ? readVideoFile : readImageFile;
        const dataUrl = await readAsDataUrl(file);
        await upload.mutateAsync({
          dataUrl,
          name: file.name,
          kind: file.type.startsWith('video/') ? 'video' : 'image',
        });
      }
      setUpdatedAt(new Date());
      toast.success(`${files.length} archivo(s) subido(s) correctamente`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo subir el archivo');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (item: MediaAlbumItem) => {
    try {
      const idsToRemove = item.mergedIds?.length ? item.mergedIds : [item.id];
      for (const id of idsToRemove) {
        if (id.startsWith('inventory:')) continue;
        await remove.mutateAsync(id);
      }
      setUpdatedAt(new Date());
      toast.success(`"${item.name}" eliminado`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo eliminar el archivo');
    }
  };

  const handleRefresh = async () => {
    await refetch();
    setUpdatedAt(new Date());
  };

  const handleSaveDrive = async () => {
    try {
      await updateDriveConfig.mutateAsync({ folderUrl });
      toast.success('Carpeta de Google Drive guardada');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar la carpeta');
    }
  };

  const handleSyncDrive = async () => {
    try {
      const result = await syncDrive.mutateAsync();
      setUpdatedAt(new Date());
      toast.success(`Sincronización: ${result.imported} nuevos, ${result.skipped} omitidos`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo sincronizar Google Drive');
    }
  };

  return (
    <div className="space-y-3">
      <AdminMediosPageHeader
        search={search}
        onSearchChange={setSearch}
        onUpload={handleUploadClick}
        onNewFolder={() => toast.message('Las carpetas estarán disponibles próximamente')}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*,video/mp4,video/*"
        multiple
        className="sr-only"
        onChange={(event) => void handleUpload(event.target.files)}
      />

      <AdminMediosKpis kpis={kpis} />

      <div className="rounded-lg border border-border/60 bg-card p-3 shadow-sm">
        <h2 className="text-xs font-semibold text-foreground">Google Drive</h2>
        <p className="mt-1 text-[0.6875rem] text-muted-foreground">
          Importa imágenes y videos desde una carpeta compartida.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="medios-drive-folder" className="text-xs">
              URL o ID de carpeta
            </Label>
            <Input
              id="medios-drive-folder"
              value={folderUrl || driveConfig?.folderUrl || ''}
              onChange={(event) => setFolderUrl(event.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              className="h-8 text-xs"
            />
          </div>
          <Button type="button" variant="outline" className="h-8 text-xs" disabled={busy} onClick={() => void handleSaveDrive()}>
            Guardar
          </Button>
          <Button type="button" variant="outline" className="h-8 text-xs" disabled={busy || !driveConfig?.folderId} onClick={() => void handleSyncDrive()}>
            Sincronizar
          </Button>
        </div>
      </div>

      <div
        className={cn(
          'grid gap-3',
          sidebarOpen
            ? 'xl:grid-cols-[minmax(0,1fr)_16rem] 2xl:grid-cols-[minmax(0,1fr)_17rem]'
            : 'lg:grid-cols-[minmax(0,1fr)_16rem] xl:grid-cols-[minmax(0,1fr)_17rem]',
        )}
      >
        <AdminMediosTablePanel items={items} isLoading={isLoading} search={search} onDelete={(item) => void handleDelete(item)} />
        <AdminMediosWidgets items={displayItems} updatedAt={updatedAt} onRefresh={() => void handleRefresh()} />
      </div>
    </div>
  );
}
