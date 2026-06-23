import { cn } from '@/lib/utils';

interface ViewAsRoleBadgeProps {
  label?: string;
  labels?: readonly string[];
  className?: string;
}

function resolveBadgeLabel(label?: string, labels?: readonly string[]): string | null {
  if (label?.trim()) return label.trim();
  if (labels && labels.length > 0) return labels.join(' · ');
  return null;
}

/** Indica el rol activo en vista previa (admin «Ver como»). */
export function ViewAsRoleBadge({ label, labels, className }: ViewAsRoleBadgeProps) {
  const displayLabel = resolveBadgeLabel(label, labels);
  if (!displayLabel) return null;

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center rounded-md bg-orange-100 px-1.5 py-0.5 text-[0.6rem] font-semibold leading-none text-orange-800 sm:text-[0.625rem]',
        className,
      )}
      title={`Vista previa como ${displayLabel}`}
    >
      <span className="truncate">Vista: {displayLabel}</span>
    </span>
  );
}
