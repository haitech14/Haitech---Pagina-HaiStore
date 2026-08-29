/** Accent estilo vitrina (rojo marca HAITECH). */
export const HAITECH_SHOWCASE_ACCENT = '#E30613';

export const HAITECH_SHOWCASE_MAX_WIDTH = '1500px';

/** Mockup completo de la sección — referencia visual y fuente de recortes. */
export const HAITECH_SHOWCASE_BENEFITS_MOCKUP = {
  png: '/haitech-home/benefits/section-full.png',
  webp: '/haitech-home/benefits/section-full.webp',
  width: 1024,
  height: 380,
  alt: 'Beneficios de comprar en HAITECH: asesor comercial dedicado, distribuidor autorizado Ricoh, envíos rápidos, soporte gratuito, garantía asegurada y contraentrega con factura',
} as const;

export const HAITECH_SHOWCASE_BENEFITS_HEADER = {
  eyebrow: 'Soluciones para tu empresa',
  titleBefore: 'Nuestros ',
  titleAccent: 'Beneficios',
  description:
    'Te ofrecemos más que productos, te brindamos respaldo, confianza y un servicio integral.',
  tagline: 'Tu aliado en soluciones de impresión',
} as const;

export const HAITECH_SHOWCASE_BENEFITS = [
  {
    id: 'asesor',
    title: 'Asesor Comercial dedicado',
    subtitle: 'Te acompañamos en todo el proceso, desde la elección del equipo hasta la postventa.',
    iconSrc: '/haitech-home/benefits/icons/asesor.ico',
  },
  {
    id: 'distribuidor',
    title: 'Distribuidor Autorizado RICOH',
    subtitle: 'Equipos originales con respaldo directo del fabricante y garantía de fábrica.',
    iconSrc: '/haitech-home/benefits/icons/distribuidor.ico',
  },
  {
    id: 'envio',
    title: 'Envíos Rápidos',
    subtitle: 'Enviamos a Nivel Nacional todos los días, con seguimiento constante de tu pedido.',
    iconSrc: '/haitech-home/benefits/icons/envio.ico',
  },
  {
    id: 'soporte',
    title: 'Asesoría, Soporte Comercial y Técnico Gratuito',
    subtitle: 'Contamos con un equipo especializado siempre disponible para ayudarte.',
    iconSrc: '/haitech-home/benefits/icons/soporte.ico',
  },
  {
    id: 'garantia',
    title: 'Garantía asegurada',
    subtitle: 'Tanto en Soporte Técnico como en Garantía de Fábrica, para tu total tranquilidad.',
    iconSrc: '/haitech-home/benefits/icons/garantia.ico',
  },
  {
    id: 'contraentrega',
    title: 'Ofrecemos Contraentrega',
    subtitle: 'Emitimos factura y somos una empresa formal, confiable y comprometida con tu negocio.',
    iconSrc: '/haitech-home/benefits/icons/contraentrega.ico',
  },
] as const;

export const HAITECH_SHOWCASE_BENEFITS_DECOR = {
  printerLeft: '/haitech-home/benefits/bg-printer-left.png',
  ricohLogo: '/haitech-home/benefits/bg-ricoh-logo.png',
  partsRight: '/haitech-home/benefits/bg-parts-right.png',
} as const;

export const HAITECH_SHOWCASE_OFERTAS = {
  title: 'OFERTAS DEL DÍA',
  subtitle: 'Equipos de impresión con precios especiales todo el año.',
  ctaLine: 'Compra hoy y paga sin intereses en 3 cuotas. Solo con',
  finePrint:
    '*Pago en 3 cuotas sin intereses. Solo con tarjetas de crédito participantes. Términos y condiciones en haitech.pe',
  productImage: '/products/ricoh-im-430f.webp',
  offersHref: '/tienda',
} as const;
