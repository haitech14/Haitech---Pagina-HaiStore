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
    id: 'servicio',
    title: 'Servicio técnico especializado',
    subtitle: 'Instalación, mantenimiento y soporte para tu flota de impresión en Lima y provincias.',
    badge: 'Soporte oficial',
    ctaLabel: 'Solicitar cotización',
    ctaHref: '/contacto',
    image: '/promo-cards/technician-service.webp',
    imageAlt: 'Técnico de servicio para equipos de impresión',
  },
  {
    id: 'multifuncionales',
    title: 'Multifuncionales Ricoh',
    subtitle: 'Ofertas en equipos nuevos y seminuevos con instalación y soporte HaiTech.',
    badge: 'Hasta 16% dto.',
    ctaLabel: 'Ver equipos',
    ctaHref: '/tienda',
    image: '/store/promos/ricoh-im-460f.png',
    imageAlt: 'Multifuncional nueva Ricoh IM 460F en promoción',
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
];
