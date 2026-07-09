import { categoryPathWithCondition } from '@/lib/category-path';

export interface StoreRicohPromoBanner {
  id: string;
  image: string;
  href: string;
  imageAlt: string;
}

/** Banners promocionales Ricoh para tienda e inicio (gráficos completos). */
export const STORE_RICOH_PROMO_BANNERS: StoreRicohPromoBanner[] = [
  {
    id: 'multifuncionales-nuevas',
    image: '/Catalogo_Nuevos_recortado.png',
    href: categoryPathWithCondition('multifuncionales', 'originales', 'multifuncionales-nuevas'),
    imageAlt:
      'Catálogo Ricoh Nuevos. Multifuncionales e impresoras nuevas para tu empresa. Equipos originales, garantía y soporte técnico.',
  },
  {
    id: 'multifuncionales-seminuevas',
    image: '/Catalogo_Seminuevos_recortado.png',
    href: categoryPathWithCondition('multifuncionales', 'compatibles', 'multifuncionales-seminuevas'),
    imageAlt:
      'Catálogo Ricoh Seminuevos. Multifuncionales e impresoras seminuevas revisadas para tu empresa. Equipos verificados, ahorro inteligente y soporte técnico.',
  },
  {
    id: 'multifuncionales-remanufacturadas',
    image: '/Catalogo_Remanufacturado_recortado.png',
    href: categoryPathWithCondition(
      'multifuncionales',
      'remanufacturados',
      'multifuncionales-remanufacturadas',
    ),
    imageAlt:
      'Catálogo Ricoh Remanufacturados. Multifuncionales e impresoras remanufacturadas con calidad para tu empresa. Calidad renovada, garantía y soporte técnico.',
  },
];
