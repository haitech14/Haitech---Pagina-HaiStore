import { Link } from 'react-router-dom';
import { Check, Circle, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import {
  formatSoftwarePrice,
  getSoftwareDisplayPrice,
  softwareDetailPath,
} from '@/data/software-catalog';
import type { SoftwareCatalogItem, SoftwarePlanId } from '@/types/software-catalog';
import { cn } from '@/lib/utils';

interface SoftwareCatalogCardProps {
  item: SoftwareCatalogItem;
  selected: boolean;
  onSelect: (item: SoftwareCatalogItem) => void;
}

function BadgeLabel({ badge }: { badge: SoftwareCatalogItem['badge'] }) {
  if (!badge) return null;
  const labels = {
    disponible: 'Disponible',
    popular: 'Popular',
    reserva: 'Bajo reserva',
  };
  const styles = {
    disponible: 'bg-emerald-100 text-emerald-700',
    popular: 'bg-red-100 text-red-700',
    reserva: 'bg-amber-100 text-amber-800',
  };
  return (
    <span
      className={cn(
        'absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold',
        styles[badge],
      )}
    >
      {labels[badge]}
    </span>
  );
}

export function SoftwareCatalogCard({ item, selected, onSelect }: SoftwareCatalogCardProps) {
  const { effectiveRole } = useAuth();
  const defaultPlanId = (item.plans.find((plan) => plan.highlighted)?.id ??
    item.plans[0]?.id ??
    'basico') as SoftwarePlanId;
  const defaultDuration = item.contractTypes.includes('mensual')
    ? 'mensual'
    : item.contractTypes[0] ?? 'anual';
  const fromPrice = getSoftwareDisplayPrice(item, defaultPlanId, defaultDuration, effectiveRole);

  return (
    <article
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow',
        selected
          ? 'border-red-600 ring-2 ring-red-600/25 shadow-md'
          : 'border-border/70 hover:border-red-600/30 hover:shadow-md',
      )}
    >
      <div className="relative aspect-[4/3] bg-muted/30">
        <BadgeLabel badge={item.badge} />
        <img
          src={item.images[0]}
          alt={item.imageAlt}
          className="size-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold leading-snug text-foreground sm:text-base">
            <Link
              to={softwareDetailPath(item.slug)}
              className="hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
            >
              {item.title}
            </Link>
          </h3>
        </div>

        {item.reviewCount > 0 ? (
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="font-semibold text-foreground">{item.rating.toFixed(1)}</span>
            <span>({item.reviewCount})</span>
          </div>
        ) : null}

        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {item.shortDescription}
        </p>

        {item.subcategoryLabel ? (
          <p className="mt-2 text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
            {item.subcategoryLabel}
          </p>
        ) : null}

        <p className="mt-3 text-sm font-bold text-neutral-950">
          Desde {formatSoftwarePrice(fromPrice, item.pricePeriod)}
        </p>

        <ul className="mt-3 space-y-1.5">
          {item.features.slice(0, 3).map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-xs text-muted-foreground">
              <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-col gap-2 pt-4 sm:flex-row">
          <Button
            asChild
            variant="outline"
            className="min-h-10 flex-1 border-border text-xs font-semibold sm:text-sm"
          >
            <Link to={softwareDetailPath(item.slug)}>Ver detalle</Link>
          </Button>
          <Button
            type="button"
            aria-pressed={selected}
            className={cn(
              'min-h-10 flex-1 gap-1.5 text-xs font-semibold sm:text-sm',
              selected
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'border border-border bg-background text-foreground hover:border-red-600/40 hover:bg-red-50',
            )}
            onClick={() => onSelect(item)}
          >
            {selected ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <Circle className="size-4" aria-hidden="true" />
            )}
            {selected ? 'Seleccionado' : 'Seleccionar'}
          </Button>
        </div>
      </div>
    </article>
  );
}
