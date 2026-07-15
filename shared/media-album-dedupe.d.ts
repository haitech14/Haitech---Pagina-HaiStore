export function normalizeMediaAlbumUrlKey(url: unknown): string;

export function dedupeMediaAlbumItems<T extends {
  id: string;
  url: string;
  kind: string;
  name: string;
  created_at: string;
}>(items: readonly T[]): Array<T & { duplicateCount: number; mergedIds: string[] }>;
