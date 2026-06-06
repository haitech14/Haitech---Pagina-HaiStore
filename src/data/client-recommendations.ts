export interface ClientRecommendation {
  id: string;
  image: string;
  imageAlt: string;
  caption: string;
}

/** Fotos de clientes y entregas (reemplaza placeholders cuando tengas más imágenes). */
export const clientRecommendations: ClientRecommendation[] = [
  {
    id: 'nbn-entrega-ricoh',
    image: '/clients/recommendations/cliente-nbn-entrega-ricoh.png',
    imageAlt:
      'Cliente satisfecho frente a NBN Copiers con su equipo Ricoh recién entregado y promoción de verano',
    caption: 'NBN — entrega y asesoría Ricoh',
  },
  {
    id: 'entrega-equipos-ricoh',
    image: '/clients/recommendations/cliente-entrega-equipos-ricoh.png',
    imageAlt:
      'Cliente satisfecho junto a su vehículo con equipos Ricoh recién entregados en el maletero',
    caption: 'Entrega de equipos Ricoh a domicilio',
  },
  {
    id: 'entrega-combobox-pro',
    image: '/clients/recommendations/cliente-entrega-combobox-pro.png',
    imageAlt:
      'Cliente recibiendo en oficina su pedido Combobox Pro junto a un equipo multifuncional Ricoh',
    caption: 'Entrega Combobox Pro en oficina',
  },
  {
    id: 'servicio-tecnico',
    image: '/promotions/promo-hero-servicio.png',
    imageAlt: 'Técnico de HaiStore brindando servicio en sitio a un cliente',
    caption: 'Soporte técnico especializado',
  },
  {
    id: 'soluciones-empresas',
    image: '/promo-cards/b2b-printer.png',
    imageAlt: 'Equipo multifuncional instalado en oficina de cliente corporativo',
    caption: 'Soluciones para empresas',
  },
  {
    id: 'ofertas-verano',
    image: '/promotions/promo-hero-ofertas.png',
    imageAlt: 'Cliente recibiendo asesoría sobre ofertas de equipos de impresión',
    caption: 'Asesoría y cotización personalizada',
  },
  {
    id: 'instalacion',
    image: '/promo-cards/technician-service.png',
    imageAlt: 'Instalación y puesta en marcha de equipo en instalaciones del cliente',
    caption: 'Instalación y capacitación',
  },
  {
    id: 'confianza-ricoh',
    image: '/publications/ricoh-news-cdp.png',
    imageAlt: 'Empresa cliente con flota Ricoh en operación',
    caption: 'Confianza en la marca Ricoh',
  },
];
