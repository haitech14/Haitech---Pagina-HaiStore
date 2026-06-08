import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  NUESTRAS_SOLUCIONES_ITEMS,
  type NuestraSolucionItem,
  type ServiceInfoboxTheme,
} from '@/data/nuestras-soluciones';
import { cn } from '@/lib/utils';

const INFOBOX_THEME_STYLES: Record<
  ServiceInfoboxTheme,
  {
    shell: string;
    glow: string;
    icon: string;
    button: string;
    arrow: string;
  }
> = {
  red: {
    shell: 'bg-gradient-to-b from-neutral-950 via-[#140808] to-neutral-950',
    glow: 'bg-red-600/25',
    icon: 'bg-red-600/20 text-red-300 ring-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.35)]',
    button: 'border-red-500/80 hover:border-red-400 hover:bg-red-600/10',
    arrow: 'text-red-400',
  },
  blue: {
    shell: 'bg-gradient-to-b from-neutral-950 via-[#081018] to-neutral-950',
    glow: 'bg-sky-500/20',
    icon: 'bg-sky-500/20 text-sky-300 ring-sky-400/50 shadow-[0_0_20px_rgba(14,165,233,0.35)]',
    button: 'border-sky-500/80 hover:border-sky-400 hover:bg-sky-500/10',
    arrow: 'text-sky-400',
  },
  purple: {
    shell: 'bg-gradient-to-b from-neutral-950 via-[#0d0818] to-neutral-950',
    glow: 'bg-violet-500/20',
    icon: 'bg-violet-500/20 text-violet-300 ring-violet-400/50 shadow-[0_0_20px_rgba(139,92,246,0.35)]',
    button: 'border-violet-500/80 hover:border-violet-400 hover:bg-violet-500/10',
    arrow: 'text-violet-400',
  },
  green: {
    shell: 'bg-gradient-to-b from-neutral-950 via-[#061210] to-neutral-950',
    glow: 'bg-emerald-500/20',
    icon: 'bg-emerald-500/20 text-emerald-300 ring-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.35)]',
    button: 'border-emerald-500/80 hover:border-emerald-400 hover:bg-emerald-500/10',
    arrow: 'text-emerald-400',
  },
};

function ServiceInfoboxCard({ item }: { item: NuestraSolucionItem }) {
  const Icon = item.icon;
  const styles = INFOBOX_THEME_STYLES[item.theme];

  return (
    <article
      className={cn(
        'group relative flex min-h-[24rem] flex-col overflow-hidden rounded-2xl border border-white/10 sm:min-h-[26rem] lg:min-h-[28rem]',
        'shadow-[0_16px_40px_-24px_rgba(0,0,0,0.85)] transition-all hover:-translate-y-0.5 hover:border-white/20',
        styles.shell,
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute -right-10 top-8 size-36 rounded-full blur-3xl',
          styles.glow,
        )}
      />

      <div className="relative z-10 flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              'flex size-11 shrink-0 items-center justify-center rounded-xl ring-1',
              styles.icon,
            )}
            aria-hidden="true"
          >
            <Icon className="size-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 pt-0.5">
            <h3 className="text-balance text-base font-bold tracking-tight text-white sm:text-lg">
              {item.infoboxTitle}
            </h3>
            <p className="mt-2 text-pretty text-sm leading-snug text-white/80">
              {item.description}
            </p>
          </div>
        </div>

        <div className="relative my-4 flex min-h-[9rem] flex-1 items-center justify-center sm:min-h-[10.5rem]">
          <img
            src={item.image}
            alt={item.imageAlt}
            className="max-h-full w-full max-w-[92%] object-contain object-center transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>

        <Link
          to={item.href}
          className={cn(
            'mx-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-full border bg-black/40 px-5 text-sm font-semibold text-white transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950',
            styles.button,
          )}
        >
          {item.ctaLabel}
          <ArrowRight className={cn('size-4', styles.arrow)} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function ServiceInfoboxGrid() {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4"
      role="list"
      aria-label="Soluciones empresariales"
    >
      {NUESTRAS_SOLUCIONES_ITEMS.map((item) => (
        <div key={item.slug} role="listitem" className="min-w-0">
          <ServiceInfoboxCard item={item} />
        </div>
      ))}
    </div>
  );
}
