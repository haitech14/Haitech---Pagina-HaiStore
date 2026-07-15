import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch, apiFetchWithRetry } from '@/lib/api';
import type {
  MediaAlbumDriveConfig,
  MediaAlbumDriveSyncResult,
  MediaAlbumItem,
  MediaAlbumItemKind,
} from '@/types/media-album';

const MEDIA_ALBUM_QUERY_KEY = ['media-album'] as const;
const MEDIA_ALBUM_DRIVE_QUERY_KEY = ['media-album', 'drive'] as const;

export function useMediaAlbum(kind?: MediaAlbumItemKind) {
  return useQuery({
    queryKey: [...MEDIA_ALBUM_QUERY_KEY, kind ?? 'all'],
    queryFn: () => {
      const params = kind ? `?kind=${encodeURIComponent(kind)}` : '';
      return apiFetchWithRetry<{ items: MediaAlbumItem[] }>(`/api/media-album${params}`);
    },
    select: (data) => data.items,
    staleTime: 30_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
    refetchOnMount: 'always',
  });
}

export function useMediaAlbumDriveConfig() {
  return useQuery({
    queryKey: MEDIA_ALBUM_DRIVE_QUERY_KEY,
    queryFn: () => apiFetch<MediaAlbumDriveConfig>('/api/media-album/drive'),
  });
}

export function useMediaAlbumMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: MEDIA_ALBUM_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: MEDIA_ALBUM_DRIVE_QUERY_KEY });
  };

  const upload = useMutation({
    mutationFn: (payload: { dataUrl: string; name?: string; kind?: MediaAlbumItemKind }) =>
      apiFetch<MediaAlbumItem>('/api/media-album/upload', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ ok: boolean }>(`/api/media-album/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }),
    onSuccess: invalidate,
  });

  const updateDriveConfig = useMutation({
    mutationFn: (payload: { folderUrl?: string; folderId?: string }) =>
      apiFetch<MediaAlbumDriveConfig>('/api/media-album/drive', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidate,
  });

  const syncDrive = useMutation({
    mutationFn: () =>
      apiFetch<MediaAlbumDriveSyncResult>('/api/media-album/drive/sync', {
        method: 'POST',
      }),
    onSuccess: invalidate,
  });

  return { upload, remove, updateDriveConfig, syncDrive };
}

export async function uploadFileToMediaAlbum(
  file: File,
  readAsDataUrl: (file: File) => Promise<string>,
): Promise<MediaAlbumItem> {
  const dataUrl = await readAsDataUrl(file);
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    throw new Error('No se pudo leer el archivo de imagen');
  }
  const kind: MediaAlbumItemKind | undefined = file.type.startsWith('video/') ? 'video' : 'image';
  return apiFetchWithRetry<MediaAlbumItem>(
    '/api/media-album/upload',
    {
      method: 'POST',
      body: JSON.stringify({ dataUrl, name: file.name, kind }),
    },
    { retries: 3, delayMs: 500 },
  );
}
