/** Accent estilo vitrina (rojo marca HAITECH). */
export const HAITECH_SHOWCASE_ACCENT = '#E30613';

export const HAITECH_SHOWCASE_MAX_WIDTH = '1320px';

export const HAITECH_SHOWCASE_BENEFITS_HEADER = {
  eyebrow: 'Tu aliado en soluciones Ricoh',
  titleBefore: 'Beneficios de comprar en ',
  titleBrand: 'HAITECH',
  subtitle:
    'Te ofrecemos más que productos, te brindamos respaldo, confianza y un servicio integral.',
} as const;

export const HAITECH_SHOWCASE_BENEFITS = [
  {
    id: 'asesor',
    title: 'Asesor Comercial dedicado',
    subtitle: 'Te acompañamos en todo el proceso, desde la elección del equipo hasta la postventa.',
    icon: 'advisor',
  },
  {
    id: 'distribuidor',
    title: 'Distribuidor Autorizado RICOH',
    subtitle: 'Equipos originales con respaldo directo del fabricante y garantía de fábrica.',
    icon: 'award',
  },
  {
    id: 'envio',
    title: 'Envíos Rápidos',
    subtitle: 'Enviamos a Nivel Nacional todos los días, con seguimiento constante de tu pedido.',
    icon: 'truck',
  },
  {
    id: 'soporte',
    title: 'Asesoría, Soporte Comercial y Técnico Gratuito',
    subtitle: 'Contamos con un equipo especializado siempre disponible para ayudarte.',
    icon: 'headset',
  },
  {
    id: 'garantia',
    title: 'Garantía asegurada',
    subtitle: 'Tanto en Soporte Técnico como en Garantía de Fábrica, para tu total tranquilidad.',
    icon: 'shield-check',
  },
  {
    id: 'contraentrega',
    title: 'Ofrecemos Contraentrega',
    subtitle: 'Emitimos factura y somos una empresa formal, confiable y comprometida con tu negocio.',
    icon: 'invoice',
  },
] as const;

export const HAITECH_SHOWCASE_OFERTAS = {
  title: 'OFERTAS DEL DÍA',
  subtitle: 'Equipos de impresión con precios especiales todo el año.',
  ctaLine: 'Compra hoy y paga sin intereses en 3 cuotas. Solo con',
  finePrint:
    '*Pago en 3 cuotas sin intereses. Solo con tarjetas de crédito participantes. Términos y condiciones en haitech.pe',
  productImage: '/products/ricoh-im-430f.webp',
  offersHref: '/tienda',
} as const;
