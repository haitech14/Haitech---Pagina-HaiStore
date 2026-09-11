/** Layout compartido para carruseles de productos en la home HAITECH. */

export const HAITECH_PRODUCT_CAROUSEL_GAP = 'gap-2 sm:gap-3.5 md:gap-4';

/** 2 tarjetas móvil · 2 sm · 3 md · 4 lg. */
export const HAITECH_PRODUCT_CAROUSEL_SLIDE =
  'min-w-0 shrink-0 flex-[0_0_calc((100%-0.5rem)/2)] sm:flex-[0_0_calc((100%-0.875rem)/2)] md:flex-[0_0_calc((100%-2rem)/3)] lg:flex-[0_0_calc((100%-3rem)/4)]';

/** Flecha flotante: no reserva espacio; se superpone al carrusel. */
export const HAITECH_PRODUCT_CAROUSEL_ARROW =
  'absolute top-1/2 z-20 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#EAEAEA] bg-white/95 text-[#E30613] shadow-[0_2px_10px_rgba(15,31,61,0.12)] backdrop-blur-[2px] transition-all duration-200 hover:scale-105 hover:border-[#E30613]/30 hover:bg-white hover:shadow-[0_4px_14px_rgba(15,31,61,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/35 disabled:pointer-events-none disabled:opacity-30 sm:size-9';

/** Posición izquierda/derecha de las flechas (sobre el borde de las tarjetas). */
export const HAITECH_PRODUCT_CAROUSEL_ARROW_LEFT = 'left-1 sm:left-2';
export const HAITECH_PRODUCT_CAROUSEL_ARROW_RIGHT = 'right-1 sm:right-2';

/**
 * @deprecated Las flechas ya no reservan gutter; se mantiene vacío por compatibilidad.
 */
export const HAITECH_PRODUCT_CAROUSEL_GUTTER = '';
