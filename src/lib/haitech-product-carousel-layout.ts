/** Layout compartido para carruseles de productos en la home HAITECH. */

export const HAITECH_PRODUCT_CAROUSEL_GAP = 'gap-2 sm:gap-3.5 md:gap-4';

/** 2 tarjetas móvil · 2 sm · 3 md · 5 lg (sin flechas encima de cards). */
export const HAITECH_PRODUCT_CAROUSEL_SLIDE =
  'min-w-0 shrink-0 flex-[0_0_calc((100%-0.5rem)/2)] sm:flex-[0_0_calc((100%-0.875rem)/2)] md:flex-[0_0_calc((100%-2rem)/3)] lg:flex-[0_0_calc((100%-4rem)/5)]';

export const HAITECH_PRODUCT_CAROUSEL_ARROW =
  'absolute top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#EAEAEA] bg-white text-[#E30613] shadow-[0_2px_10px_rgba(15,31,61,0.10)] transition-all duration-200 hover:scale-105 hover:border-[#E30613]/30 hover:shadow-[0_4px_14px_rgba(15,31,61,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/35 disabled:pointer-events-none disabled:opacity-30 sm:size-9';

/** Espacio lateral para flechas fuera del track de productos. */
export const HAITECH_PRODUCT_CAROUSEL_GUTTER = 'px-3 sm:px-11 lg:px-12';
