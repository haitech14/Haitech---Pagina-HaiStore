import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

import { servicesLandingTestimonials } from '@/data/services-landing';
import { cn } from '@/lib/utils';

interface ServicesLandingTestimonialsProps {
  className?: string;
}

export function ServicesLandingTestimonials({ className }: ServicesLandingTestimonialsProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  return (
    <section
      aria-labelledby="servicios-landing-testimonios-titulo"
      className={cn('bg-muted/20 py-10 sm:py-14', className)}
    >
      <div className="container px-4 sm:px-6">
        <h2
          id="servicios-landing-testimonios-titulo"
          className="text-center text-2xl font-bold tracking-tight text-[#0f1f3d] sm:text-3xl"
        >
          La confianza de nuestros clientes
        </h2>

        <div className="relative mt-8">
          <div ref={emblaRef} className="overflow-hidden">
            <ul className="flex gap-4 sm:gap-6">
              {servicesLandingTestimonials.map((item) => (
                <li
                  key={item.id}
                  className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_calc((100%-1.5rem)/2)] lg:flex-[0_0_calc((100%-3rem)/3)]"
                >
                  <figure className="flex h-full flex-col rounded-2xl border border-border/60 bg-white p-5 shadow-sm sm:p-6">
                    <span
                      className="flex size-9 items-center justify-center rounded-full bg-primary text-lg font-bold leading-none text-primary-foreground"
                      aria-hidden="true"
                    >
                      &ldquo;
                    </span>
                    <blockquote className="mt-4 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {item.quote}
                    </blockquote>
                    <figcaption className="mt-5 flex items-center gap-3 border-t border-border/60 pt-4">
                      <img
                        src={item.image}
                        alt=""
                        className="size-10 rounded-full object-cover"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#0f1f3d]">{item.customerName}</p>
                        <p className="truncate text-xs text-muted-foreground">{item.customerRole}</p>
                      </div>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 flex justify-center gap-2" role="tablist" aria-label="Testimonios">
            {servicesLandingTestimonials.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selectedIndex === index}
                aria-label={`Testimonio ${index + 1}`}
                className={cn(
                  'size-2.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  selectedIndex === index ? 'bg-primary' : 'bg-border',
                )}
                onClick={() => scrollTo(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
