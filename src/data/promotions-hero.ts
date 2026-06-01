export interface PromotionSlide {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  imageAlt: string;
}

export const promotionSlides: PromotionSlide[] = [
  {
    id: 'multifuncionales',
    title: 'Multifuncionales en promoción',
    subtitle: 'Imprime, escanea y copia con equipos Ricoh y más. Precios corporativos desde la primera unidad.',
    badge: 'Hasta 21% dto.',
    ctaLabel: 'Ver multifuncionales',
    ctaHref: '/tienda',
    image: '/promotions/promo-hero-multifuncionales.png',
    imageAlt: 'Impresora multifuncional de oficina en promoción',
  },
  {
    id: 'ofertas',
    title: 'Ofertas de temporada',
    subtitle: 'Tóner, suministros y tecnología seleccionada con descuentos exclusivos por tiempo limitado.',
    badge: 'Hasta 50% dto.',
    ctaLabel: 'Ver ofertas',
    ctaHref: '/tienda',
    image: '/promotions/promo-hero-ofertas.png',
    imageAlt: 'Fondo promocional de ofertas HaiStore',
  },
  {
    id: 'servicio',
    title: 'Servicio técnico especializado',
    subtitle: 'Instalación, mantenimiento y soporte para tu flota de impresión en Lima y provincias.',
    badge: 'Soporte oficial',
    ctaLabel: 'Solicitar cotización',
    ctaHref: '/contacto',
    image: '/promo-cards/technician-service.png',
    imageAlt: 'Técnico de servicio para equipos de impresión',
  },
];
