import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  NUESTRAS_SOLUCIONES_ITEMS,
  type NuestraSolucionDarkVariant,
  type NuestraSolucionItem,
} from '@/data/nuestras-soluciones';
import type { ServiceLandingSlug } from '@/data/service-landings';
import { cn } from '@/lib/utils';

const DARK_VARIANT_STYLES: Record<
  NuestraSolucionDarkVariant,
  { header: string; footer: string; accent: string }
> = {
  rental: {
    header: 'bg-gradient-to-br from-neutral-950 via-[#1a1208] to-neutral-900',
    footer: 'bg-neutral-950',
    accent: 'bg-amber-500/15',
  },
  support: {
    header: 'bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800',
    footer: 'bg-neutral-950',
    accent: 'bg-red-600/15',
  },
  outsourcing: {
    header: 'bg-gradient-to-br from-[#0a1628] via-[#0f2038] to-[#152238]',
    footer: 'bg-[#0a1628]',
    accent: 'bg-blue-500/15',
  },
  corporate: {
    header: 'bg-gradient-to-br from-[#0c1424] via-[#101c32] to-[#162544]',
    footer: 'bg-[#0c1424]',
    accent: 'bg-sky-500/15',
  },
};

interface NuestrasSolucionesLightCardProps {
  item: NuestraSolucionItem;
  isSelected: boolean;
  onSelect: () => void;
}

export function NuestrasSolucionesLightCard({
  item,
  isSelected,
  onSelect,
}: NuestrasSolucionesLightCardProps) {
  const Icon = item.icon;

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-[0_4px_24px_-12px_hsl(var(--foreground)/0.12)] transition-all',
        isSelected
          ? 'border-red-600 ring-2 ring-red-600/25'
          : 'border-border/70 hover:border-red-600/30 hover:shadow-[0_8px_28px_-14px_hsl(var(--foreground)/0.18)]',
      )}
    >
      {isSelected ? (
        <span
          className="absolute right-3 top-3 z-10 flex size-7 items-center justify-center rounded-full bg-red-600 text-white shadow-sm"
          aria-hidden="true"
        >
          <Check className="size-4" strokeWidth={2.5} />
        </span>
      ) : null}

      <button
        type="button"
        onClick={onSelect}
        className="flex flex-1 flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
        aria-pressed={isSelected}
      >
        <div className="flex flex-col gap-3 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
          <span
            className={cn(
              'flex size-12 items-center justify-center rounded-full',
              isSelected ? 'bg-red-600/10 text-red-600' : 'bg-sky-100 text-[#1e4a8c]',
            )}
            aria-hidden="true"
          >
            <Icon className="size-6" strokeWidth={1.75} />
          </span>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-[#1a365d] sm:text-xl">
              {item.title}
            </h3>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          </div>
        </div>

        <div className="px-5 sm:px-6">
          <div className="overflow-hidden rounded-xl border border-border/50 bg-muted/30">
            <img
              src={item.image}
              alt={item.imageAlt}
              className="aspect-[16/10] w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
          </div>
        </div>
      </button>

      <div className="mt-5 px-5 pb-5 sm:px-6 sm:pb-6">
        <Link
          to={item.href}
          className={cn(
            'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
            isSelected
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'border border-[#1e4a8c]/35 bg-background text-[#1e4a8c] hover:border-[#1e4a8c]/55 hover:bg-sky-50/50',
          )}
        >
          {isSelected ? 'Seleccionado' : 'Ver servicios'}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

interface NuestrasSolucionesDarkCardProps {
  item: NuestraSolucionItem;
  isActive: boolean;
  onSelect: () => void;
  idPrefix?: string;
}

export function NuestrasSolucionesDarkCard({
  item,
  isActive,
  onSelect,
  idPrefix = 'servicios-hub',
}: NuestrasSolucionesDarkCardProps) {
  const styles = DARK_VARIANT_STYLES[item.darkVariant];

  return (
    <article className="min-w-0">
      <button
        type="button"
        role="tab"
        id={`${idPrefix}-tab-${item.slug}`}
        aria-selected={isActive}
        aria-controls={`${idPrefix}-panel-${item.slug}`}
        onClick={onSelect}
        className={cn(
          'group flex min-h-[20rem] w-full flex-col overflow-hidden rounded-2xl border bg-card text-left shadow-[0_12px_32px_-18px_hsl(var(--foreground)/0.55)] transition-all sm:min-h-[22rem] lg:min-h-[26rem] lg:aspect-[3/4] lg:max-h-[28rem]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
          isActive
            ? 'border-red-600 shadow-[0_0_0_1px_hsl(0_72%_51%),0_16px_40px_-16px_rgba(220,38,38,0.45)]'
            : 'border-border/70 hover:-translate-y-0.5 hover:border-red-600/35',
        )}
      >
        <div className={cn('relative px-4 pb-4 pt-4 sm:px-5 sm:pt-5', styles.header)}>
          <div
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute -right-6 top-0 size-24 rounded-full blur-3xl',
              styles.accent,
            )}
          />
          <div className="relative flex flex-col gap-2">
            <p className="text-balance text-lg font-bold tracking-tight text-white sm:text-xl">
              {item.title}
            </p>
            <p className="text-pretty text-sm leading-snug text-white/85">{item.hubDescription}</p>
            <span className="sr-only">{item.imageAlt}</span>
          </div>
        </div>

        <div className="relative flex min-h-[9.5rem] flex-1 items-end justify-center bg-gradient-to-b from-white to-neutral-100 px-3 pb-2 pt-3 sm:min-h-[10.5rem] sm:px-4">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-neutral-950/20 to-transparent"
          />
          <img
            src={item.image}
            alt=""
            className="relative z-10 max-h-full w-full object-contain object-bottom transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </div>

        <div className={cn('flex items-center px-4 py-3 sm:px-5', styles.footer)}>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-sm font-semibold transition-colors',
              isActive ? 'text-red-400' : 'text-red-500 group-hover:text-red-400',
            )}
          >
            {isActive ? 'Seleccionado' : 'Ver servicios'}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </button>
    </article>
  );
}

interface NuestrasSolucionesLightGridProps {
  selectedSlug?: ServiceLandingSlug;
  onSelect?: (slug: ServiceLandingSlug) => void;
}

export function NuestrasSolucionesLightGrid({
  selectedSlug = 'alquiler',
  onSelect,
}: NuestrasSolucionesLightGridProps) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6"
      role="list"
      aria-label="Nuestras soluciones empresariales"
    >
      {NUESTRAS_SOLUCIONES_ITEMS.map((item) => (
        <div key={item.slug} role="listitem" className="min-w-0">
          <NuestrasSolucionesLightCard
            item={item}
            isSelected={selectedSlug === item.slug}
            onSelect={() => onSelect?.(item.slug)}
          />
        </div>
      ))}
    </div>
  );
}

interface NuestrasSolucionesDarkGridProps {
  activeSection: ServiceLandingSlug;
  onSelect: (section: ServiceLandingSlug) => void;
  idPrefix?: string;
}

export function NuestrasSolucionesDarkGrid({
  activeSection,
  onSelect,
  idPrefix = 'servicios-hub',
}: NuestrasSolucionesDarkGridProps) {
  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
      role="tablist"
      aria-label="Categorías de servicios"
    >
      {NUESTRAS_SOLUCIONES_ITEMS.map((item) => (
        <NuestrasSolucionesDarkCard
          key={item.slug}
          item={item}
          isActive={activeSection === item.slug}
          onSelect={() => onSelect(item.slug)}
          idPrefix={idPrefix}
        />
      ))}
    </div>
  );
}
