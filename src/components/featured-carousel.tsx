import { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const slides = [
  { title: 'Rebajas de temporada', subtitle: 'Hasta -40% en audio', accent: 'bg-primary' },
  { title: 'Novedades Hai', subtitle: 'Lo último en periféricos', accent: 'bg-secondary' },
  { title: 'Envío gratis', subtitle: 'En pedidos superiores a 50 €', accent: 'bg-accent' },
] as const;

export function FeaturedCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section aria-label="Destacados" className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide) => (
            <div className="min-w-0 flex-[0_0_100%] pr-4 sm:flex-[0_0_50%]" key={slide.title}>
              <Card>
                <CardContent className="flex h-40 flex-col justify-center gap-1 p-6">
                  <span
                    className={`mb-2 inline-block h-2 w-12 rounded-full ${slide.accent}`}
                    aria-hidden="true"
                  />
                  <h3 className="text-xl font-bold">{slide.title}</h3>
                  <p className="text-muted-foreground">{slide.subtitle}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" size="icon" onClick={scrollPrev} aria-label="Anterior">
          <ChevronLeft aria-hidden="true" />
        </Button>
        <Button variant="outline" size="icon" onClick={scrollNext} aria-label="Siguiente">
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
