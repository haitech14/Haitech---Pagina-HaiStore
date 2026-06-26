export type PromoCardVariant = 'dark-b2b' | 'light-service' | 'dark-offers';
export type PromoCardButtonVariant = 'red' | 'navy';

export interface PromoCard {
  id: string;
  variant: PromoCardVariant;
  title: string;
  subtitle?: string;
  description?: string;
  features?: readonly string[];
  image: string;
  imageAlt: string;
  buttonLabel: string;
  buttonVariant: PromoCardButtonVariant;
  href: string;
}

export const promoCards: PromoCard[] = [
  {
    id: 'b2b',
    variant: 'dark-b2b',
    title: '¿Compras para tu empresa?',
    subtitle: 'Soluciones B2B a medida',
    features: [
      'Factura inmediata',
      'Leasing y renting tecnológico',
      'Contratos de mantenimiento',
      'Precios especiales por volumen',
    ],
    image: '/promo-cards/b2b-printer.png',
    imageAlt: 'Multifuncional Ricoh profesional para empresas',
    buttonLabel: 'Ver soluciones B2B',
    buttonVariant: 'red',
    href: '/tienda?categoria=soluciones-negocio',
  },
  {
    id: 'service',
    variant: 'light-service',
    title: 'Servicio técnico especializado',
    description: 'Diagnóstico, mantenimiento y reparaciones con garantía.',
    image: '/promo-cards/technician-service.webp',
    imageAlt: 'Técnico especializado reparando equipo de impresión',
    buttonLabel: 'Agendar servicio',
    buttonVariant: 'navy',
    href: '/contacto',
  },
  {
    id: 'offers',
    variant: 'dark-offers',
    title: 'Ofertas y descuentos por tiempo limitado',
    description: 'Aprovecha nuestras promociones exclusivas.',
    image: '/promo-cards/discount-percent.png',
    imageAlt: 'Símbolo de descuento en oferta especial',
    buttonLabel: 'Ver ofertas',
    buttonVariant: 'red',
    href: '/tienda',
  },
];
