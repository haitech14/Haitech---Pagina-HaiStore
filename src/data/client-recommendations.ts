export interface ClientRecommendation {
  id: string;
  image: string;
  imageAlt: string;
  /** Título en negrita bajo la foto. */
  title: string;
  /** Cita del cliente en cursiva. */
  quote: string;
  customerName: string;
  customerCity: string;
}

/** Testimonios reales con fotos de entrega (sin placeholders de stock). */
export const clientRecommendations: ClientRecommendation[] = [
  {
    id: 'entrega-equipos-ricoh',
    image: '/clients/recommendations/cliente-entrega-equipos-ricoh.png',
    imageAlt:
      'Cliente satisfecho junto a su vehículo con equipos Ricoh recién entregados en el maletero',
    title: 'Entrega de equipos Ricoh a domicilio',
    quote:
      'El equipo llegó en perfecto estado y en el tiempo acordado. Muy profesionales.',
    customerName: 'Carlos M.',
    customerCity: 'Lima',
  },
  {
    id: 'nbn-verano-ricoh',
    image: '/clients/recommendations/cliente-nbn-verano-ricoh.png',
    imageAlt:
      'Cliente satisfecho frente a NBN Importadores con su equipo Ricoh recién entregado y promoción de verano',
    title: 'NBN — entrega y asesoría Ricoh',
    quote:
      'Excelente asesoría y atención personalizada. Resolvieron todas mis dudas.',
    customerName: 'Jorge L.',
    customerCity: 'Arequipa',
  },
  {
    id: 'entrega-combobox-pro',
    image: '/clients/recommendations/cliente-entrega-combobox-pro.png',
    imageAlt:
      'Cliente recibiendo en oficina su pedido Combobox Pro junto a un equipo multifuncional Ricoh',
    title: 'Entrega Combobox Pro en oficina',
    quote:
      'El equipo llegó listo para usar y el soporte durante la instalación fue impecable.',
    customerName: 'Luis R.',
    customerCity: 'Trujillo',
  },
  {
    id: 'entrega-equipos-osias',
    image: '/clients/recommendations/osias.png',
    imageAlt:
      'Cliente satisfecho junto a su camioneta con equipos embalados y asegurados tras la entrega a domicilio',
    title: 'Entrega de equipos embalados a domicilio',
    quote:
      'Llegó todo bien protegido y en el día pactado. Muy buena coordinación con el equipo de entregas.',
    customerName: 'Osías V.',
    customerCity: 'Lima',
  },
  {
    id: 'nbn-entrega-ricoh',
    image: '/clients/recommendations/cliente-nbn-entrega-ricoh.png',
    imageAlt:
      'Cliente satisfecho recibiendo su equipo Ricoh en la entrega a domicilio con NBN Importadores',
    title: 'Entrega Ricoh — NBN Importadores',
    quote:
      'Todo salió perfecto: el equipo, la instalación y el seguimiento. Volveremos a comprar con ustedes.',
    customerName: 'Miguel A.',
    customerCity: 'Lima',
  },
];
