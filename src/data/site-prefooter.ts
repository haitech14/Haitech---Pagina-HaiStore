import { Package, Printer, ShieldCheck, type LucideIcon } from 'lucide-react';

import { categoryLandingPath } from '@/lib/category-path';

export type SitePrefooterItem = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Enlace SEO contextual (landings competitivas). */
  href?: string;
};

/** Franja de confianza encima del footer (rojo / negro) + enlaces a hubs SEO. */
export const SITE_PREFOOTER_ITEMS: readonly SitePrefooterItem[] = [
  {
    id: 'fotocopiadoras',
    title: 'Fotocopiadoras',
    description: 'Venta y alquiler Ricoh con canal autorizado.',
    icon: Printer,
    href: '/fotocopiadoras-ricoh',
  },
  {
    id: 'distribuidor-autorizado',
    title: 'Distribuidor Autorizado Ricoh',
    description: 'Respaldo oficial Ricoh, garantía y postventa.',
    icon: ShieldCheck,
    href: '/distribuidor-autorizado-ricoh',
  },
  {
    id: 'impresoras',
    title: 'Impresoras',
    description: 'Impresoras láser Ricoh para oficina y empresa.',
    icon: Printer,
    href: '/categoria/impresoras',
  },
  {
    id: 'nuestros-productos',
    title: 'Nuestros Productos',
    description: 'Catálogo de equipos, tóner y suministros.',
    icon: Package,
    href: '/tienda',
  },
] as const;

/** Enlaces SEO adicionales bajo la franja (compactos). */
export const SITE_PREFOOTER_SEO_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Escáneres', href: categoryLandingPath('escaneres') },
  { label: 'Guías', href: '/guias' },
  { label: 'Modelos', href: '/modelos' },
  { label: 'Servicios', href: '/servicios' },
  { label: 'Formato ancho', href: categoryLandingPath('formato-ancho') },
];
