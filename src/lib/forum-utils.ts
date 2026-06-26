import {
  Brain,
  Code2,
  Cpu,
  MessageSquare,
  Newspaper,
  Rocket,
  Shield,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  brain: Brain,
  'code-2': Code2,
  cpu: Cpu,
  shield: Shield,
  rocket: Rocket,
  newspaper: Newspaper,
  'message-square': MessageSquare,
};

export function getForumCategoryIcon(iconKey: string): LucideIcon {
  return ICON_MAP[iconKey] ?? MessageSquare;
}

export function formatForumCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(value);
}

export function formatForumRelativeTime(isoDate: string | null | undefined): string {
  if (!isoDate) return 'Reciente';
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Hace ${days} d`;
  return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}

export function formatForumEventDate(isoDate: string): { month: string; day: string } {
  const date = new Date(isoDate);
  return {
    month: date.toLocaleDateString('es-PE', { month: 'short' }).replace('.', ''),
    day: String(date.getDate()),
  };
}

export const FORUM_NAV_ITEMS = [
  { to: '/foro', label: 'Foros', end: true },
  { to: '/foro/preguntas', label: 'Preguntas', end: true },
  { to: '/foro/tutoriales', label: 'Tutoriales', end: true },
  { to: '/foro/firmware', label: 'Firmware', end: true },
  { to: '/foro/miembros', label: 'Miembros', end: true },
] as const;
