import {
  Globe,
  Mail,
  MessageCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { BandejaChannel, BandejaPriority, BandejaStatus } from '@/types/bandeja';

function BandejaInstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

type ChannelIcon = LucideIcon | typeof BandejaInstagramIcon;

const CHANNEL_META: Record<
  BandejaChannel,
  { label: string; color: string; icon: ChannelIcon }
> = {
  whatsapp: { label: 'WhatsApp', color: '#25D366', icon: MessageCircle },
  email: { label: 'Email', color: '#3B82F6', icon: Mail },
  web: { label: 'Web', color: '#6366F1', icon: Globe },
  facebook: { label: 'Facebook', color: '#1877F2', icon: MessageCircle },
  instagram: { label: 'Instagram', color: '#E4405F', icon: BandejaInstagramIcon },
};

export function BandejaChannelBadge({
  channel,
  showLabel = true,
  className,
}: {
  channel: BandejaChannel;
  showLabel?: boolean;
  className?: string;
}) {
  const meta = CHANNEL_META[channel];
  const Icon = meta.icon;

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span
        className="inline-flex size-5 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${meta.color}18`, color: meta.color }}
      >
        <Icon className="size-3" aria-hidden="true" />
      </span>
      {showLabel ? (
        <span className="truncate text-xs text-foreground">{meta.label}</span>
      ) : null}
    </span>
  );
}

const PRIORITY_STYLES: Record<BandejaPriority, string> = {
  alta: 'border-red-200 bg-red-50 text-red-700',
  media: 'border-amber-200 bg-amber-50 text-amber-700',
  baja: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

const PRIORITY_LABELS: Record<BandejaPriority, string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

export function BandejaPriorityBadge({ priority }: { priority: BandejaPriority }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-md border px-2 py-0.5 text-[0.6875rem] font-semibold',
        PRIORITY_STYLES[priority],
      )}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

const STATUS_STYLES: Record<BandejaStatus, string> = {
  abierto: 'border-emerald-300 bg-transparent text-emerald-700',
  en_progreso: 'border-blue-300 bg-transparent text-blue-700',
  pendiente: 'border-violet-300 bg-transparent text-violet-700',
  resuelto: 'border-emerald-500 bg-emerald-500 text-white',
};

const STATUS_LABELS: Record<BandejaStatus, string> = {
  abierto: 'Abierto',
  en_progreso: 'En progreso',
  pendiente: 'Pendiente',
  resuelto: 'Resuelto',
};

export function BandejaStatusBadge({ status }: { status: BandejaStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-md border px-2 py-0.5 text-[0.6875rem] font-semibold',
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function BandejaAssigneeAvatar({
  initials,
  color,
  name,
}: {
  initials: string;
  color: string;
  name: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-bold text-white"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      >
        {initials}
      </span>
      <span className="truncate text-xs text-foreground">{name}</span>
    </span>
  );
}
