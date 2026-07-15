export type MediaAlbumItemKind = 'image' | 'video' | 'youtube';

export type MediaAlbumItemSource = 'upload' | 'google_drive' | 'import' | 'inventory';

export interface MediaAlbumItem {
  id: string;
  url: string;
  kind: MediaAlbumItemKind;
  name: string;
  source: MediaAlbumItemSource;
  google_drive_file_id?: string | null;
  created_at: string;
  bytes?: number | null;
  width?: number | null;
  height?: number | null;
  /** SHA-256 del archivo persistido (para fusionar duplicados byte a byte). */
  content_hash?: string | null;
  /** Repeticiones agrupadas con la misma URL. */
  duplicateCount?: number;
  /** IDs fusionados al deduplicar (para eliminar todas las copias). */
  mergedIds?: string[];
}

export interface MediaAlbumDriveConfig {
  folderId: string | null;
  folderUrl: string | null;
  lastSyncAt: string | null;
  hasApiKey: boolean;
  hasServiceAccount: boolean;
}

export interface MediaAlbumDriveSyncResult {
  ok: boolean;
  imported: number;
  skipped: number;
  total: number;
  errors: Array<{ fileId: string; name: string; message: string }>;
}
