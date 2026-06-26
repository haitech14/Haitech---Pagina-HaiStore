import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SOFTWARE_CATALOG_ID } from '@/data/software-catalog';
import { softwareLandingHero } from '@/data/software-landing';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';
import { cn } from '@/lib/utils';

interface SoftwareStorefrontHeroProps {
  className?: string;
}

export function SoftwareStorefrontHero({ className }: SoftwareStorefrontHeroProps) {
  const whatsappHref = buildHaitechWhatsAppUrl(softwareLandingHero.whatsappMessage);

  const scrollToCatalog = () => {
    document.getElementById(SOFTWARE_CATALOG_ID)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <section
      aria-labelledby="software-storefront-hero-titulo"
      className={cn('relative w-full overflow-hidden', className)}
    >
      <div className="relative min-h-[18rem] sm:min-h-[22rem] md:min-h-[26rem] lg:min-h-[28rem]">
        <img
          src={softwareLandingHero.image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover object-center"
          fetchPriority="high"
          decoding="async"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-neutral-950/85"
          aria-hidden="true"
        />

        <div className="container relative z-10 flex min-h-[inherit] flex-col items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-12">
          <h1
            id="software-storefront-hero-titulo"
            className="max-w-4xl text-balance font-hero text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl lg:text-[2.75rem]"
          >
            {softwareLandingHero.title}
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-white/90 sm:text-base md:text-lg">
            {softwareLandingHero.subtitle}
          </p>

          <div className="mt-6 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Button
              type="button"
              className="min-h-11 gap-2 bg-red-600 px-6 text-sm font-semibold text-white hover:bg-red-700"
              onClick={scrollToCatalog}
            >
              <FileText className="size-4" aria-hidden="true" />
              {softwareLandingHero.quoteCtaLabel}
            </Button>
            <Button
              asChild
              variant="outline"
              className="min-h-11 border-white/40 bg-white/95 px-6 text-sm font-semibold text-neutral-950 hover:bg-white"
            >
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <Icon path={mdiWhatsapp} size={0.85} className="text-[#25D366]" aria-hidden="true" />
                {softwareLandingHero.whatsappCtaLabel}
              </a>
            </Button>
          </div>
        </div>
      </div>
      <span className="sr-only">{softwareLandingHero.imageAlt}</span>
    </section>
  );
}
