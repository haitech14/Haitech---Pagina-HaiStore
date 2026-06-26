import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { ServicesLandingServiceCard } from '@/data/services-landing';
import { servicesLandingSectionId } from '@/data/services-landing';
import { cn } from '@/lib/utils';

interface ServicesLandingServiceCardTileProps {
  card: ServicesLandingServiceCard;
}

export function ServicesLandingServiceCardTile({ card }: ServicesLandingServiceCardTileProps) {
  const Icon = card.icon;

  return (
    <article
      id={servicesLandingSectionId(card.slug)}
      className="scroll-mt-24 flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_8px_32px_-20px_hsl(var(--foreground)/0.2)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={card.image}
          alt=""
          className="size-full object-cover object-center"
          loading="lazy"
        />
        <span
          className="absolute bottom-0 left-5 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border-2 border-primary bg-white shadow-md sm:left-6 sm:size-12"
          aria-hidden="true"
        >
          <Icon className="size-5 text-primary sm:size-6" strokeWidth={1.75} />
        </span>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-8 sm:px-6 sm:pb-6 sm:pt-9">
        <h3 className="text-balance text-base font-bold text-[#0f1f3d] sm:text-lg">{card.title}</h3>
        <ul className="mt-3 flex flex-1 flex-col gap-2">
          {card.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2 text-sm leading-snug text-muted-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" strokeWidth={2.5} />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
        <Link
          to={card.href}
          className={cn(
            'mt-5 inline-flex min-h-11 items-center justify-center gap-2 text-sm font-semibold text-primary',
            'transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          )}
        >
          Conocer más
          <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
        </Link>
        <span className="sr-only">{card.imageAlt}</span>
      </div>
    </article>
  );
}
