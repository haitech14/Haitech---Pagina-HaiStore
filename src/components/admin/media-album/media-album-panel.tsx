import { useMemo, useRef, useState } from 'react';
import { CloudUpload, HardDriveDownload, Loader2, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useMediaAlbum,
  useMediaAlbumDriveConfig,
  useMediaAlbumMutations,
} from '@/hooks/use-media-album';
import { dedupeMediosForDisplay } from '@/lib/admin-medios-utils';
import { readImageFile, readVideoFile } from '@/lib/inventory-product';
import { cn } from '@/lib/utils';

export function MediaAlbumPanel() {
  const { data: items = [], isLoading } = useMediaAlbum();
  const displayItems = useMemo(() => dedupeMediosForDisplay(items), [items]);
  const { data: driveConfig } = useMediaAlbumDriveConfig();
  const { upload, remove, updateDriveConfig, syncDrive } = useMediaAlbumMutations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [folderUrl, setFolderUrl] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setStatus(null);
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
      setStatus(`${files.length} archivo(s) subido(s) y optimizado(s) en el álbum.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'No se pudo subir al álbum.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveDrive = async () => {
    setStatus(null);
    try {
      await updateDriveConfig.mutateAsync({ folderUrl });
      setStatus('Carpeta de Google Drive guardada.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'No se pudo guardar la carpeta.');
    }
  };

  const handleSyncDrive = async () => {
    setStatus(null);
    try {
      const result = await syncDrive.mutateAsync();
      const errorCount = result.errors?.length ?? 0;
      setStatus(
        `Sincronización completada: ${result.imported} nuevos, ${result.skipped} omitidos` +
          (errorCount > 0 ? `, ${errorCount} con error.` : '.'),
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'No se pudo sincronizar Google Drive.');
    }
  };

  const busy =
    upload.isPending || remove.isPending || updateDriveConfig.isPending || syncDrive.isPending;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
        <h2 className="text-lg font-semibold text-foreground">Álbum interno</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Biblioteca central de fotos y vídeos optimizados. Incluye las imágenes guardadas en
          inventario y las subidas al álbum.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            className="gap-1.5"
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
          >
            {upload.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <CloudUpload className="size-4" aria-hidden="true" />
            )}
            Subir al álbum
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/*,video/mp4,video/*"
            multiple
            className="sr-only"
            onChange={(event) => void handleUpload(event.target.files)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
        <h3 className="text-sm font-semibold text-foreground">Google Drive</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Conecta una carpeta compartida para importar imágenes y vídeos al álbum. Configura en el
          servidor{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">GOOGLE_DRIVE_API_KEY</code> o{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON
          </code>
          .
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="album-drive-folder">URL o ID de carpeta</Label>
            <Input
              id="album-drive-folder"
              value={folderUrl || driveConfig?.folderUrl || ''}
              onChange={(event) => setFolderUrl(event.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
            />
          </div>
          <Button type="button" variant="outline" disabled={busy} onClick={() => void handleSaveDrive()}>
            Guardar
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            disabled={busy || !driveConfig?.folderId}
            onClick={() => void handleSyncDrive()}
          >
            {syncDrive.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <HardDriveDownload className="size-4" aria-hidden="true" />
            )}
            Sincronizar
          </Button>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          {driveConfig?.hasServiceAccount
            ? 'Cuenta de servicio detectada.'
            : driveConfig?.hasApiKey
              ? 'API key detectada (carpeta pública).'
              : 'Sin credenciales de Google Drive en el servidor.'}
          {driveConfig?.lastSyncAt
            ? ` Última sync: ${new Date(driveConfig.lastSyncAt).toLocaleString('es-PE')}.`
            : null}
        </p>
      </div>

      {status ? (
        <p className="text-sm text-muted-foreground" role="status">
          {status}
        </p>
      ) : null}

      <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">
            Medios ({displayItems.length})
          </h3>
          {isLoading ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />
          ) : null}
        </div>

        {displayItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">El álbum está vacío.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {displayItems.map((item) => (
              <li
                key={item.mergedIds?.join(':') ?? item.id}
                className="group relative overflow-hidden rounded-lg border border-border bg-muted/20"
              >
                <div className="aspect-square relative">
                  {item.kind === 'video' ? (
                    <video
                      src={item.url}
                      className="size-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <img src={item.url} alt="" className="size-full object-cover" loading="lazy" />
                  )}
                  {(item.duplicateCount ?? 1) > 1 ? (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-background/90 px-1.5 py-0.5 text-[0.625rem] font-semibold text-foreground shadow-sm">
                      ×{item.duplicateCount}
                    </span>
                  ) : null}
                </div>
                <div className="space-y-1 p-2">
                  <p className="truncate text-xs font-medium">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {item.source === 'google_drive'
                      ? 'Google Drive'
                      : item.source === 'inventory'
                        ? 'Inventario'
                        : item.source === 'import'
                          ? 'Importado'
                          : 'Subida'}
                  </p>
                </div>
                {item.source !== 'inventory' ? (
                <button
                  type="button"
                  className={cn(
                    'absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100',
                    'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                  aria-label={`Eliminar ${item.name}`}
                  disabled={busy}
                  onClick={() => void remove.mutateAsync(item.id)}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
