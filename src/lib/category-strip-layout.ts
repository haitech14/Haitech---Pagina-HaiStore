/** Altura visual de una tarjeta del carrusel de categorías (círculo + etiqueta). */
export const CATEGORY_STRIP_CARD_HEIGHT_CLASS =
  'h-[8.25rem] sm:h-[11.375rem] md:h-[12.625rem] lg:h-[13.75rem]';

/** Altura del banner hero compacto (más grande que las tarjetas de categoría). */
export const CATEGORY_STRIP_HERO_HEIGHT_CLASS =
  'h-[15.5rem] sm:h-[22rem] md:h-[25.5rem] lg:h-[28.5rem] xl:h-[30.5rem]';

/** Padding vertical del hero compacto (pegado al nav y a categorías). */
export const CATEGORY_STRIP_HERO_PADDING_CLASS = 'p-0';

/** Recorte vertical simétrico para reducir márgenes blancos del PNG del banner. */
export const CATEGORY_STRIP_HERO_VERTICAL_CROP = 0.92;

/** Contenedor del carrusel; el hero compacto usa el mismo ancho hasta las flechas. */
export const CATEGORY_STRIP_TRACK_WRAPPER_CLASS = 'relative sm:px-1';

/** Expande el hero compacto hasta el borde exterior de las flechas (sm+). */
export const CATEGORY_STRIP_HERO_GUTTER_CLASS =
  'w-full sm:-mx-1 sm:w-[calc(100%+0.5rem)] lg:-mx-3 lg:w-[calc(100%+1.5rem)]';
