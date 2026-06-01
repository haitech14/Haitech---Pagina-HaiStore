import type { EmblaCarouselType } from 'embla-carousel';

/** Evita arrastrar el carrusel al interactuar con enlaces o controles dentro de una diapositiva. */
export function emblaShouldWatchDrag(
  _emblaApi: EmblaCarouselType,
  event: MouseEvent | TouchEvent,
): boolean {
  const target = event.target;
  if (!(target instanceof Element)) return true;
  return !target.closest('a, button, input, textarea, select, label, [role="dialog"]');
}
