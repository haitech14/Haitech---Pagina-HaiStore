import type {
  ProductDescriptionContent,
  ProductDescriptionStoryBlock,
} from '@/types/product-detail';
import { Cloud, Gauge, Inbox, Smartphone } from 'lucide-react';

const PRODUCT_IMAGE = '/products/ricoh-im-430f.webp';
const PRODUCT_IMAGE_2 = '/products/ricoh-im-430f-2.webp';
const PRODUCT_IMAGE_3 = '/products/ricoh-im-430f-3.webp';
const OFFICE_IMAGE = '/promo-cards/technician-service.webp';
const B2B_IMAGE = '/promo-cards/b2b-printer.png';
const COLLAB_IMAGE = '/solutions/colaboracion.png';

/** Video oficial Ricoh: IM 430F Product Overview. */
export const IM430F_YOUTUBE_VIDEO_ID = 'T9ZuDfDWAww';
export const IM430F_YOUTUBE_TITLE = 'RICOH IM 430F — descripción del producto';

export const IM430F_STORY_BLOCKS: ProductDescriptionStoryBlock[] = [
  {
    id: 'productividad',
    title: 'Diseñada para la productividad de tu oficina',
    body: 'La RICOH IM 430F imprime y copia hasta 43 páginas por minuto en blanco y negro, con primera copia en unos 5 segundos. Compacta para escritorio y ampliable con bandejas adicionales, mantiene el ritmo de equipos que no pueden detenerse.',
    imagePosition: 'end',
    imageSrc: PRODUCT_IMAGE,
    imageAlt: 'Multifuncional RICOH IM 430F',
  },
  {
    id: 'flujos-trabajo',
    title: 'Imprime, copia, escanea y faxea en un solo equipo',
    body: 'Centraliza el flujo documental: impresión, copia, escaneo a correo o carpeta y fax. El alimentador automático de documentos de una pasada acelera originales a dos caras y reduce el manejo manual de papel.',
    imagePosition: 'start',
    imageSrc: PRODUCT_IMAGE_2,
    imageAlt: 'RICOH IM 430F con alimentador de documentos',
  },
  {
    id: 'panel-inteligente',
    title: 'Panel táctil inteligente de 10,1"',
    body: 'El Smart Operation Panel de 10,1 pulgadas simplifica cada trabajo: cambia entre copia, escaneo y aplicaciones Ricoh con un toque. Ideal para que cualquier usuario opere el equipo sin curva de aprendizaje.',
    imagePosition: 'end',
    imageSrc: PRODUCT_IMAGE_3,
    imageAlt: 'Pantalla táctil Smart Operation Panel de la IM 430F',
  },
  {
    id: 'capacidad-papel',
    title: 'Más capacidad para tiradas largas',
    body: 'Bandeja estándar de 550 hojas, ampliables hasta 2.100 hojas con caseteras opcionales. Repones menos veces el papel y sostienes volúmenes de oficina sin interrumpir la producción.',
    imagePosition: 'start',
    imageSrc: B2B_IMAGE,
    imageAlt: 'Oficina con alto volumen de impresión',
  },
  {
    id: 'movil-nube',
    title: 'Imprime desde el móvil y la nube',
    body: 'Conecta por Wi-Fi, red o USB e imprime desde iOS y Android con AirPrint, Mopria y RICOH Smart Device Connector. Comparte archivos escaneados a correo, carpeta o servicios en la nube sin pasar por un PC.',
    imagePosition: 'end',
    visual: 'smartphone-cloud',
    imageAlt: 'Impresión móvil y en la nube',
  },
  {
    id: 'soporte-local',
    title: 'Respaldo Haitech en todo el Perú',
    body: 'Como Distribuidor Autorizado Ricoh, Haitech entrega el equipo con garantía oficial, tóner original, instalación opcional y soporte técnico pre y postventa. Cotiza configuración, caseteras y garantía extendida con un asesor.',
    imagePosition: 'start',
    imageSrc: OFFICE_IMAGE,
    imageAlt: 'Soporte técnico Haitech para equipos Ricoh',
  },
  {
    id: 'equipos-hibridos',
    title: 'Lista para equipos de trabajo híbridos',
    body: 'Escanea a carpeta y correo, autentica usuarios y protege documentos con las funciones de seguridad de Ricoh. Encaja en oficinas pequeñas y en flotas que necesitan control de costos por copia.',
    imagePosition: 'end',
    imageSrc: COLLAB_IMAGE,
    imageAlt: 'Equipos colaborando con documentos digitales',
  },
  {
    id: 'sostenible',
    title: 'Eficiencia energética y menor desperdicio',
    body: 'Impresión a doble cara, modo de reposo y certificación ENERGY STAR ayudan a bajar el consumo eléctrico y el uso de papel, sin sacrificar la velocidad de 43 ppm ni la calidad de 1.200 dpi.',
    imagePosition: 'start',
    visual: 'sustainability',
    imageAlt: 'Impresión sostenible ENERGY STAR',
  },
];

export const IM430F_DESCRIPTION: ProductDescriptionContent = {
  overviewTitle: 'Diseñada para la productividad',
  overviewParagraphs: [
    'La RICOH IM 430F mejora los flujos de trabajo documentales y optimiza la eficiencia de tu negocio con funciones inteligentes y una alta confiabilidad.',
  ],
  overviewLink: {
    label: 'Más información sobre la serie IM 430',
    href: '/tienda',
  },
  paragraphs: [],
  youtubeVideoId: IM430F_YOUTUBE_VIDEO_ID,
  youtubeTitle: IM430F_YOUTUBE_TITLE,
  storyBlocks: IM430F_STORY_BLOCKS,
  highlights: [
    { icon: Gauge, title: 'Alta velocidad', subtitle: 'Hasta 43 ppm B/N' },
    { icon: Inbox, title: 'Gran capacidad', subtitle: 'Hasta 2,100 hojas' },
    { icon: Smartphone, title: 'Pantalla inteligente', subtitle: 'Pantalla táctil de 10.1"' },
    { icon: Cloud, title: 'Conectividad', subtitle: 'Impresión móvil y en la nube' },
  ],
};
