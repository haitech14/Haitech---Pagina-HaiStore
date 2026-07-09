import { categoryPathWithCondition } from '@/lib/category-path';

export interface HomePromoMiniBanner {
  id: string;
  href: string;
  image: string;
  imageAlt: string;
}

/** Tres banners promocionales Ricoh bajo el hero de inicio. */
export const homePromoMiniBanners: HomePromoMiniBanner[] = [
  {
    id: 'multifuncionales-nuevas',
    href: categoryPathWithCondition('multifuncionales', 'originales', 'multifuncionales-nuevas'),
    image: '/Catalogo_Nuevos_recortado.png',
    imageAlt:
      'Catálogo Ricoh Nuevos. Multifuncionales e impresoras nuevas para tu empresa. Equipos originales, garantía y soporte técnico.',
  },
  {
    id: 'multifuncionales-seminuevas',
    href: categoryPathWithCondition('multifuncionales', 'compatibles', 'multifuncionales-seminuevas'),
    image: '/Catalogo_Seminuevos_recortado.png',
    imageAlt:
      'Catálogo Ricoh Seminuevos. Multifuncionales e impresoras seminuevas revisadas para tu empresa. Equipos verificados, ahorro inteligente y soporte técnico.',
  },
  {
    id: 'multifuncionales-remanufacturadas',
    href: categoryPathWithCondition(
      'multifuncionales',
      'remanufacturados',
      'multifuncionales-remanufacturadas',
    ),
    image: '/Catalogo_Remanufacturado_recortado.png',
    imageAlt:
      'Catálogo Ricoh Remanufacturados. Multifuncionales e impresoras remanufacturadas con calidad para tu empresa. Calidad renovada, garantía y soporte técnico.',
  },
];
