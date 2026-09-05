import { categoryLandingPath } from '@/lib/category-path';
import { serviceHubPath } from '@/lib/service-hub';

export type SeoLandingCta = {
  label: string;
  to: string;
  external?: boolean;
};

export type SeoLandingFaq = {
  id: string;
  question: string;
  answer: string;
};

export type SeoCommercialLanding = {
  pathname: string;
  title: string;
  description: string;
  pageName: string;
  eyebrow: string;
  h1: string;
  lead: string;
  paragraphs: string[];
  ctas: SeoLandingCta[];
  relatedLinks: SeoLandingCta[];
  faq: SeoLandingFaq[];
};

export const SEO_COMMERCIAL_LANDINGS: Record<string, SeoCommercialLanding> = {
  'fotocopiadoras-peru': {
    pathname: '/fotocopiadoras-peru',
    title: 'Fotocopiadoras Perú | Haitech',
    description:
      'Compra o alquila fotocopiadoras en Perú con Distribuidor Autorizado Ricoh. Multifuncionales nuevas y seminuevas, tóner, instalación en Lima y envío nacional.',
    pageName: 'Fotocopiadoras Perú',
    eyebrow: 'Venta y alquiler · Perú',
    h1: 'Fotocopiadoras Perú',
    lead:
      'HaiStore (HaiTech) concentra la oferta de fotocopiadoras y multifuncionales Ricoh para empresas en Lima y provincias: compra, alquiler, tóner y soporte técnico en un solo canal autorizado.',
    paragraphs: [
      'Si buscas fotocopiadoras en Perú para oficina, estudio o producción ligera, el primer paso es dimensionar páginas mensuales, color o blanco y negro, formato A4/A3 y si prefieres invertir en compra o un plan de alquiler con mantenimiento. En nuestro catálogo encontrarás multifuncionales nuevas, seminuevas y remanufacturadas con ficha técnica, stock y precio en USD, pensadas para flujos reales de empresas peruanas.',
      'Como Distribuidor Autorizado Ricoh te orientamos en el modelo correcto (serie IM, MP u otras) y en el suministro de tóner original o compatible para no detener la operación. Coordinamos delivery e instalación en Lima Metropolitana y envíos a provincia según el equipo, con asesoría comercial por WhatsApp cuando necesitas una cotización rápida con tu ciudad y volumen estimado.',
      'Compara también impresoras láser, plotters de formato ancho y repuestos. Muchas empresas combinan la compra del multifuncional con un stock inicial de tóner y un plan de servicio técnico; otras prefieren alquiler para fijar un costo mensual. En ambos casos el objetivo es el mismo: imprimir sin interrupciones y con respaldo de canal autorizado.',
      'Antes de decidir, revisa nuestras guías (cómo elegir multifuncional, alquiler vs compra) y los hubs por modelo (IM 550F, IM 430F, IM C300F, etc.). Si ya tienes un parque Ricoh, te ayudamos a estandarizar consumibles y a planificar reposición. Cotiza desde la categoría de multifuncionales, la landing de Distribuidor Autorizado Ricoh o directamente por WhatsApp con el modelo y tu ubicación.',
      'HaiStore opera desde Av. Petit Thouars 1935, Lince, Lima, con cobertura a nivel nacional. Trabajamos con empresas, estudios, colegios y talleres de servicio que buscan fotocopiadoras confiables, precios claros y postventa especializada. El catálogo se actualiza con stock real: verifica disponibilidad online o consulta si el equipo que necesitas está en tránsito o en proceso de acondicionamiento seminuevo.',
    ],
    ctas: [
      { label: 'Ver fotocopiadoras', to: categoryLandingPath('multifuncionales') },
      { label: 'Cotizar alquiler', to: serviceHubPath('alquiler') },
    ],
    relatedLinks: [
      { label: 'Fotocopiadoras Ricoh', to: '/fotocopiadoras-ricoh' },
      { label: 'Alquiler en Lima', to: '/alquiler-fotocopiadoras-lima' },
      { label: 'Distribuidor Autorizado', to: '/distribuidor-autorizado-ricoh' },
      { label: 'Guías de compra', to: '/guias' },
    ],
    faq: [
      {
        id: 'donde-comprar',
        question: '¿Dónde comprar fotocopiadoras en Perú?',
        answer:
          'En HaiStore puedes comprar fotocopiadoras y multifuncionales Ricoh online o por WhatsApp, con envío a Lima y provincias. Atendemos empresas desde Av. Petit Thouars 1935, Lince.',
      },
      {
        id: 'alquiler-o-compra',
        question: '¿Conviene alquilar o comprar una fotocopiadora?',
        answer:
          'El alquiler conviene si prefieres costo mensual predecible con mantenimiento y tóner según plan. La compra es ideal cuando el volumen justifica la inversión. Te ayudamos a comparar ambas opciones.',
      },
      {
        id: 'envio',
        question: '¿Hacen envío e instalación a provincia?',
        answer:
          'Sí. Coordinamos delivery en Lima e instalación según modelo, y envíos de equipos e insumos a otras ciudades del Perú.',
      },
      {
        id: 'seminuevas',
        question: '¿Venden fotocopiadoras seminuevas?',
        answer:
          'Sí. Ofrecemos equipos seminuevos revisados con prueba de impresión y garantía documentada, además de equipos nuevos de fábrica.',
      },
    ],
  },
  'fotocopiadoras-ricoh': {
    pathname: '/fotocopiadoras-ricoh',
    title: 'Fotocopiadoras | Haitech',
    description:
      'Fotocopiadoras y multifuncionales Ricoh en Perú: venta, alquiler, tóner y repuestos. Haitech es Distribuidor Autorizado con stock, garantía y soporte técnico.',
    pageName: 'Fotocopiadoras',
    eyebrow: 'Ricoh · Canal autorizado',
    h1: 'Fotocopiadoras',
    lead:
      'Elige multifuncionales Ricoh con asesoría de Distribuidor Autorizado: modelos de oficina y alto volumen, nuevos o seminuevos, con tóner y servicio técnico especializados.',
    paragraphs: [
      'Las fotocopiadoras Ricoh destacan por productividad, conectividad de red y ecosistema de tóner y repuestos. En HaiStore filtramos el catálogo por condición (nuevo/seminuevo), color, formato y velocidad para que compares sin perder tiempo y llegues a una cotización alineada a tu volumen real de páginas.',
      'A diferencia de un intermediario genérico, el canal autorizado te da respaldo de garantía, orientación de modelo (IM 430F, IM 550F, IM C320F, IM C300F, IM 460F y más) y postventa con técnicos que conocen la marca. Si también necesitas consumibles, enlazamos al hub de tóner Ricoh y a la categoría de repuestos para evitar códigos incorrectos.',
      '¿Prefieres no inmovilizar capital? Revisa alquiler de fotocopiadoras en Lima y planes mensuales con mantenimiento según contrato. ¿Quieres entender A4 vs A3, ppm o SPDF? Consulta nuestras guías antes de cotizar; ahí resumimos los criterios que usamos con clientes empresariales en Perú.',
      'La tienda oficial Ricoh cubre el catálogo de fábrica; HaiStore complementa con stock local, seminuevos certificados, atención ágil por WhatsApp y soluciones de alquiler. Puedes empezar por la categoría de multifuncionales, por un hub de modelo concreto o por una conversación de asesoría indicando tu ciudad, páginas mensuales y si necesitas color.',
      'Para flotas mixtas (oficina + sucursales) ayudamos a estandarizar modelos y consumibles, reduciendo paradas y costos ocultos. Cotiza con Distribuidor Autorizado Ricoh en Perú y recibe una propuesta clara de equipo, tóner de arranque e instalación cuando aplique.',
    ],
    ctas: [
      { label: 'Catálogo multifuncionales', to: categoryLandingPath('multifuncionales') },
      { label: 'Ver modelos destacados', to: '/modelos/im-550f' },
    ],
    relatedLinks: [
      { label: 'Fotocopiadoras Perú', to: '/fotocopiadoras-peru' },
      { label: 'Tóner Ricoh', to: '/toner-ricoh' },
      { label: 'Distribuidor Autorizado', to: '/distribuidor-autorizado-ricoh' },
      { label: 'Cómo elegir multifuncional', to: '/guias/como-elegir-multifuncional-ricoh' },
    ],
    faq: [
      {
        id: 'autorizado',
        question: '¿HaiStore es Distribuidor Autorizado Ricoh?',
        answer:
          'Sí. Comercializamos equipos, tóner y repuestos Ricoh con respaldo de canal autorizado en Perú, garantía y soporte técnico especializado.',
      },
      {
        id: 'modelos',
        question: '¿Qué modelos Ricoh tienen en stock?',
        answer:
          'El stock cambia según demanda. Consulta multifuncionales nuevas y seminuevas en la tienda, o hubs por modelo (IM 550F, IM 430F, IM C300F y más).',
      },
      {
        id: 'vs-oficial',
        question: '¿En qué se diferencia de la tienda oficial Ricoh?',
        answer:
          'Complementamos la oferta oficial con stock local, seminuevos certificados, alquiler, tóner compatible y atención comercial ágil por WhatsApp para empresas en todo el Perú.',
      },
      {
        id: 'toner',
        question: '¿Puedo comprar tóner junto con la fotocopiadora?',
        answer:
          'Sí. Cotizamos el equipo y el tóner (original o compatible) en la misma conversación para el arranque y la reposición.',
      },
    ],
  },
  'alquiler-fotocopiadoras-lima': {
    pathname: '/alquiler-fotocopiadoras-lima',
    title: 'Alquiler | Haitech',
    description:
      'Alquila fotocopiadoras e impresoras Ricoh en Lima con mantenimiento y tóner según plan. Cotiza con Distribuidor Autorizado Haitech para empresas.',
    pageName: 'Alquiler',
    eyebrow: 'Alquiler · Lima Metropolitana',
    h1: 'Alquiler',
    lead:
      'Planes mensuales de alquiler de multifuncionales e impresoras Ricoh para empresas en Lima: costo predecible, instalación y soporte técnico de Distribuidor Autorizado.',
    paragraphs: [
      'El alquiler de fotocopiadoras en Lima permite operar con equipo Ricoh sin la inversión inicial de compra. Según el contrato puedes incluir mantenimiento, tóner y atención técnica para mantener el costo por página bajo control y evitar sorpresas cuando el volumen crece.',
      'Indicamos el modelo según páginas mensuales, color, formato A4/A3 y plazo. Instalamos en sedes de Lima Metropolitana (incluye coordinación por distrito) y también evaluamos cobertura a provincia cuando el proyecto lo requiere. El objetivo es dejar el equipo operativo con la configuración de red y consumibles adecuados.',
      'Si más adelante prefieres comprar, migramos la cotización a venta de equipos nuevos o seminuevos sin empezar de cero. Revisa el hub de servicios de alquiler, la guía alquiler vs compra, o cotiza por WhatsApp con tu distrito, páginas estimadas y si necesitas monocromo o color.',
      'Empresas con varias sedes en Lima suelen estandarizar un mismo modelo para simplificar tóner y servicio. Te proponemos opciones de alto volumen (por ejemplo familias IM) o equipos más compactos según el flujo de cada oficina. Todas las cotizaciones se elaboran como Distribuidor Autorizado Ricoh.',
    ],
    ctas: [
      { label: 'Ver planes de alquiler', to: serviceHubPath('alquiler') },
      { label: 'Comparar compra vs alquiler', to: '/guias/alquiler-vs-compra-fotocopiadora' },
    ],
    relatedLinks: [
      { label: 'Fotocopiadoras Perú', to: '/fotocopiadoras-peru' },
      { label: 'Servicio técnico', to: serviceHubPath('servicio-tecnico') },
      { label: 'Multifuncionales', to: categoryLandingPath('multifuncionales') },
      { label: 'Contacto Lima', to: '/contacto' },
    ],
    faq: [
      {
        id: 'incluye',
        question: '¿Qué incluye el alquiler de fotocopiadoras en Lima?',
        answer:
          'Depende del plan: equipo Ricoh, mantenimiento y, en muchos casos, tóner según volumen. Te detallamos condiciones antes de firmar.',
      },
      {
        id: 'plazo',
        question: '¿Cuál es el plazo mínimo?',
        answer:
          'Los plazos se acuerdan según el modelo y el volumen. Cotiza con tu necesidad mensual y te proponemos opciones.',
      },
      {
        id: 'distritos',
        question: '¿Atienden todos los distritos de Lima?',
        answer:
          'Sí, coordinamos instalación y servicio en Lima Metropolitana. Confirma tu distrito al cotizar para agendar logística.',
      },
      {
        id: 'color',
        question: '¿Puedo alquilar multifuncional a color?',
        answer:
          'Sí. Tenemos opciones monocromo y color; la elección depende del volumen de color y del presupuesto mensual.',
      },
    ],
  },
  'toner-ricoh': {
    pathname: '/toner-ricoh',
    title: 'Tóner | Haitech',
    description:
      'Compra tóner Ricoh original y compatible en Perú. Cartuchos para fotocopiadoras e impresoras con asesoría de Distribuidor Autorizado y envío nacional.',
    pageName: 'Tóner',
    eyebrow: 'Consumibles · Stock permanente',
    h1: 'Tóner',
    lead:
      'Reposición de tóner Ricoh para fotocopiadoras, multifuncionales e impresoras: originales certificados y compatibles de buen rendimiento, con envío a Lima y provincias.',
    paragraphs: [
      'Elegir el tóner correcto evita paradas y fallas de calidad. En HaiStore te ayudamos con el código de cartucho según tu modelo (IM, MP, SP y más) y te ofrecemos línea original o compatible según tu política de costo por página, sin mezclar referencias que dañen el equipo o la garantía.',
      'Como Distribuidor Autorizado Ricoh priorizamos compatibilidad y stock. Si gestionas varias sedes, cotizamos volumen y programas de reposición. Combina el pedido con tintas, unidades de imagen, fusores u otros repuestos para reducir envíos y tiempos muertos.',
      '¿Dudas entre original y compatible? Lee la guía dedicada: resume cuándo conviene cada opción en flotas de oficina. ¿Necesitas el equipo también? Enlaza a fotocopiadoras Ricoh, hubs por modelo o al catálogo de suministros para armar una cotización completa.',
      'Despachamos a Lima y provincias. Indica el modelo exacto (o foto de la etiqueta del cartucho) por WhatsApp y te confirmamos disponibilidad, plazos y alternativas. El objetivo es mantener tu parque Ricoh imprimiendo con insumos correctos y precios claros en USD.',
    ],
    ctas: [
      { label: 'Ver tóner y suministros', to: categoryLandingPath('toner-suministros') },
      { label: 'Original vs compatible', to: '/guias/toner-original-vs-compatible' },
    ],
    relatedLinks: [
      { label: 'Repuestos Ricoh', to: categoryLandingPath('repuestos') },
      { label: 'Fotocopiadoras Ricoh', to: '/fotocopiadoras-ricoh' },
      { label: 'Distribuidor Autorizado', to: '/distribuidor-autorizado-ricoh' },
      { label: 'Preguntas frecuentes', to: '/preguntas-frecuentes' },
    ],
    faq: [
      {
        id: 'como-elegir',
        question: '¿Cómo sé qué tóner Ricoh necesito?',
        answer:
          'Indica el modelo exacto de tu fotocopiadora o impresora (o el código del cartucho). Te confirmamos la referencia original o compatible adecuada.',
      },
      {
        id: 'original',
        question: '¿Venden tóner original Ricoh?',
        answer:
          'Sí. Contamos con tóner original y también alternativas compatibles con buena relación costo-rendimiento.',
      },
      {
        id: 'envio-toner',
        question: '¿Envían tóner a provincia?',
        answer:
          'Sí. Despachamos a Lima y provincias. El plazo depende del destino y del stock del cartucho.',
      },
      {
        id: 'volumen',
        question: '¿Hay precio por volumen?',
        answer:
          'Para empresas y talleres cotizamos volumen corporativo. Escríbenos por WhatsApp con cantidades y modelos.',
      },
    ],
  },
};

export function getSeoCommercialLanding(slug: string): SeoCommercialLanding | null {
  return SEO_COMMERCIAL_LANDINGS[slug] ?? null;
}

export const SEO_COMMERCIAL_LANDING_SLUGS = Object.keys(SEO_COMMERCIAL_LANDINGS);
