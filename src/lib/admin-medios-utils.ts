import type { MediaAlbumItem, MediaAlbumItemKind, MediaAlbumItemSource } from '@/types/media-album';
import { dedupeMediaAlbumItems } from '../../shared/media-album-dedupe.js';

export interface AdminMediosKpi {
  title: string;
  value: string;
  trend: number;
  trendLabel: string;
  icon: 'storage' | 'recent' | 'images' | 'documents';
  sparkline: number[];
  trendIsPercent?: boolean;
}

export interface AdminMediosTypeSlice {
  label: string;
  count: number;
  color: string;
}

export interface AdminMediosSourceSlice {
  label: string;
  count: number;
  percent: number;
  color: string;
}

export interface AdminMediosRecentItem {
  id: string;
  name: string;
  kind: MediaAlbumItemKind;
  source: MediaAlbumItemSource;
  createdAt: Date;
}

const SOURCE_LABELS: Record<MediaAlbumItemSource, string> = {
  upload: 'Subida',
  google_drive: 'Google Drive',
  import: 'Importado',
  inventory: 'Inventario',
};

const SOURCE_COLORS: Record<MediaAlbumItemSource, string> = {
  upload: '#3B82F6',
  google_drive: '#22C55E',
  import: '#8B5CF6',
  inventory: '#F59E0B',
};

const KIND_LABELS: Record<MediaAlbumItemKind, string> = {
  image: 'Imágenes',
  video: 'Videos',
  youtube: 'YouTube',
};

const KIND_COLORS: Record<MediaAlbumItemKind, string> = {
  image: '#3B82F6',
  video: '#8B5CF6',
  youtube: '#EF4444',
};

export function formatMediosBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`.replace('.0', '');
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function buildMediosKpis(items: MediaAlbumItem[]): AdminMediosKpi[] {
  const totalBytes = items.reduce((sum, item) => sum + (item.bytes ?? 0), 0);
  const images = items.filter((item) => item.kind === 'image').length;
  const videos = items.filter((item) => item.kind === 'video' || item.kind === 'youtube').length;
  const recent = items.filter((item) => {
    const created = new Date(item.created_at).getTime();
    return Date.now() - created < 1000 * 60 * 60 * 24 * 7;
  }).length;

  return [
    {
      title: 'Almacenamiento usado',
      value: formatMediosBytes(totalBytes),
      trend: 12,
      trendLabel: 'vs. mes anterior',
      icon: 'storage',
      sparkline: [40, 44, 48, 52, 58, 62, 68, Math.max(totalBytes / (1024 * 1024), 1)],
      trendIsPercent: true,
    },
    {
      title: 'Archivos recientes',
      value: String(recent),
      trend: 5,
      trendLabel: 'últimos 7 días',
      icon: 'recent',
      sparkline: [2, 3, 4, 4, 5, 6, recent, recent],
    },
    {
      title: 'Imágenes',
      value: String(images),
      trend: 8,
      trendLabel: 'vs. mes anterior',
      icon: 'images',
      sparkline: [10, 12, 14, 16, 18, 20, 22, images],
    },
    {
      title: 'Videos y documentos',
      value: String(videos),
      trend: 3,
      trendLabel: 'vs. mes anterior',
      icon: 'documents',
      sparkline: [1, 2, 2, 3, 3, 4, 4, videos],
    },
  ];
}

export function buildMediosTypeDistribution(items: MediaAlbumItem[]): AdminMediosTypeSlice[] {
  const counts = new Map<MediaAlbumItemKind, number>();
  for (const item of items) {
    counts.set(item.kind, (counts.get(item.kind) ?? 0) + 1);
  }

  return (['image', 'video', 'youtube'] as const)
    .map((kind) => ({
      label: KIND_LABELS[kind],
      count: counts.get(kind) ?? 0,
      color: KIND_COLORS[kind],
    }))
    .filter((slice) => slice.count > 0);
}

export function buildMediosSourceDistribution(items: MediaAlbumItem[]): AdminMediosSourceSlice[] {
  const total = items.length || 1;
  const counts = new Map<MediaAlbumItemSource, number>();
  for (const item of items) {
    counts.set(item.source, (counts.get(item.source) ?? 0) + 1);
  }

  return (['upload', 'inventory', 'google_drive', 'import'] as const).map((source) => {
    const count = counts.get(source) ?? 0;
    return {
      label: SOURCE_LABELS[source],
      count,
      percent: Math.round((count / total) * 100),
      color: SOURCE_COLORS[source],
    };
  });
}

export function buildMediosRecentItems(items: MediaAlbumItem[], limit = 5): AdminMediosRecentItem[] {
  return [...items]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      name: item.name,
      kind: item.kind,
      source: item.source,
      createdAt: new Date(item.created_at),
    }));
}

export function sourceLabel(source: MediaAlbumItemSource): string {
  return SOURCE_LABELS[source];
}

export function kindLabel(kind: MediaAlbumItemKind): string {
  return KIND_LABELS[kind];
}

export function dedupeMediosForDisplay(items: MediaAlbumItem[]): MediaAlbumItem[] {
  return dedupeMediaAlbumItems(items) as MediaAlbumItem[];
}
